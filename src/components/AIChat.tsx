import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { X, Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecognition, speakText } from "@/hooks/useVoiceRecognition";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat = ({ isOpen, onClose }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI car assistant. I can help you find the perfect car, answer questions about pricing, compare models, or assist with selling your vehicle. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const { toast } = useToast();

  const handleVoiceResult = useCallback((transcript: string) => {
    setInput(transcript);
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    toast({
      title: "Voice Error",
      description: error === "not-allowed" 
        ? "Please allow microphone access to use voice input." 
        : "Voice recognition failed. Please try again.",
      variant: "destructive",
    });
  }, [toast]);

  const {
    isListening,
    isSupported: isVoiceSupported,
    language,
    startListening,
    stopListening,
    toggleLanguage,
  } = useVoiceRecognition({
    onResult: handleVoiceResult,
    onError: handleVoiceError,
  });

  // Load voices when component mounts
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("car-assistant", {
        body: { message: textToSend },
      });

      if (error) {
        throw error;
      }

      if (data?.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);

        // Speak the response if speech is enabled
        if (isSpeechEnabled) {
          speakText(data.message, language);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      // Auto-send after stopping if there's input
      if (input.trim()) {
        setTimeout(() => sendMessage(), 100);
      }
    } else {
      startListening();
    }
  };

  const toggleSpeech = () => {
    if (isSpeechEnabled) {
      window.speechSynthesis?.cancel();
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col border-2 shadow-elegant">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-hero text-primary-foreground">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <h2 className="text-xl font-bold">AI Car Assistant</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className="text-primary-foreground hover:bg-primary-foreground/20 gap-1 text-xs font-semibold"
                >
                  <Languages className="h-4 w-4" />
                  {language === "en-IN" ? "EN" : "हिं"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch to {language === "en-IN" ? "Hindi" : "English"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Speech Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSpeech}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  {isSpeechEnabled ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <VolumeX className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSpeechEnabled ? "Mute voice" : "Enable voice"}</p>
              </TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-5 w-5 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-secondary/30">
          {/* Voice status indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 mb-3 text-sm text-primary animate-pulse">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <span>
                {language === "en-IN" ? "Listening..." : "सुन रहा हूं..."}
              </span>
            </div>
          )}
          
          <div className="flex gap-2">
            {/* Voice Input Button */}
            {isVoiceSupported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isListening ? "default" : "outline"}
                    size="icon"
                    onClick={handleVoiceToggle}
                    disabled={isLoading}
                    className={isListening ? "bg-primary animate-pulse" : ""}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isListening ? "Stop listening" : `Speak in ${language === "en-IN" ? "English" : "Hindi"}`}</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === "en-IN" ? "Ask anything about cars..." : "कारों के बारे में कुछ भी पूछें..."}
              disabled={isLoading || isListening}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-accent hover:bg-accent/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
