import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type Language = "en-IN" | "hi-IN";

interface UseWhisperRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: Language;
  silenceThreshold?: number; // dB threshold for silence detection
  silenceDuration?: number; // ms of silence before auto-stop
}

export const useWhisperRecognition = ({
  onResult,
  onError,
  language = "en-IN",
  silenceThreshold = -45,
  silenceDuration = 1500,
}: UseWhisperRecognitionOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const vadIntervalRef = useRef<number | null>(null);
  const hasSpokenRef = useRef(false);

  const stopVAD = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    silenceStartRef.current = null;
    hasSpokenRef.current = false;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Set up audio analysis for VAD
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.1;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        stopVAD();
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        try {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(",")[1];

            try {
              const { data, error } = await supabase.functions.invoke("voice-to-text", {
                body: { audio: base64Audio, language },
              });

              if (error) {
                throw error;
              }

              if (data?.text) {
                onResult(data.text);
              } else {
                onError?.("No transcription received");
              }
            } catch (err) {
              console.error("Whisper API error:", err);
              onError?.("Failed to transcribe audio. Please try again.");
            } finally {
              setIsProcessing(false);
            }
          };

          reader.readAsDataURL(audioBlob);
        } catch (err) {
          console.error("Audio processing error:", err);
          onError?.("Failed to process audio");
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);

      // Start VAD monitoring
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      vadIntervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume in dB
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const volumeDb = average > 0 ? 20 * Math.log10(average / 255) : -100;
        
        const now = Date.now();
        
        if (volumeDb > silenceThreshold) {
          // User is speaking
          hasSpokenRef.current = true;
          silenceStartRef.current = null;
        } else if (hasSpokenRef.current) {
          // Silence detected after speech
          if (!silenceStartRef.current) {
            silenceStartRef.current = now;
          } else if (now - silenceStartRef.current > silenceDuration) {
            // Auto-stop after silence duration
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
            }
          }
        }
      }, 100);

    } catch (err) {
      console.error("Microphone access error:", err);
      onError?.("Could not access microphone. Please check permissions.");
    }
  }, [language, onResult, onError, silenceThreshold, silenceDuration, stopVAD]);

  const stopRecording = useCallback(() => {
    stopVAD();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording, stopVAD]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    isActive: isRecording || isProcessing,
  };
};
