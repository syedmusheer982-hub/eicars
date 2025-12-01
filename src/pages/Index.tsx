import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { FeaturedCars } from "@/components/FeaturedCars";
import { AIChat } from "@/components/AIChat";
import { FloatingVoiceButton } from "@/components/FloatingVoiceButton";

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [startInVoiceMode, setStartInVoiceMode] = useState(false);

  const openChat = (voiceMode = false) => {
    setStartInVoiceMode(voiceMode);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setStartInVoiceMode(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <Hero onOpenChat={() => openChat(false)} />
        <Services />
        <FeaturedCars />
      </div>
      <FloatingVoiceButton onClick={() => openChat(true)} />
      <AIChat isOpen={isChatOpen} onClose={closeChat} startInVoiceMode={startInVoiceMode} />
    </div>
  );
};

export default Index;
