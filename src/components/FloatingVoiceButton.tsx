import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingVoiceButtonProps {
  onClick: () => void;
}

export const FloatingVoiceButton = ({ onClick }: FloatingVoiceButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-hero shadow-elegant hover:scale-110 transition-transform duration-200 animate-pulse hover:animate-none"
          >
            <Mic className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Voice Assistant</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
