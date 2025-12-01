import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type Language = "en-IN" | "hi-IN";

interface UseWhisperRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: Language;
}

export const useWhisperRecognition = ({
  onResult,
  onError,
  language = "en-IN",
}: UseWhisperRecognitionOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
    } catch (err) {
      console.error("Microphone access error:", err);
      onError?.("Could not access microphone. Please check permissions.");
    }
  }, [language, onResult, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    isActive: isRecording || isProcessing,
  };
};
