import { useState, useCallback, useRef, useEffect } from "react";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

type Language = "en-IN" | "hi-IN";

interface UseVoiceRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceRecognition = ({ onResult, onError }: UseVoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<Language>("en-IN");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      onError?.(event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognitionRef.current?.abort();
    };
  }, [isSupported, onResult, onError]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    
    recognitionRef.current.lang = language;
    recognitionRef.current.start();
    setIsListening(true);
  }, [language, isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === "en-IN" ? "hi-IN" : "en-IN"));
  }, []);

  return {
    isListening,
    isSupported,
    language,
    startListening,
    stopListening,
    toggleLanguage,
    setLanguage,
  };
};

// Text-to-speech utility
export const speakText = (text: string, language: "en-IN" | "hi-IN" = "en-IN") => {
  if (!("speechSynthesis" in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.9;
  utterance.pitch = 1;

  // Try to find a voice for the language
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find((voice) => voice.lang.startsWith(language.split("-")[0]));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};
