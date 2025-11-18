import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { FeaturedCars } from "@/components/FeaturedCars";
import { AIChat } from "@/components/AIChat";

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        <Hero onOpenChat={() => setIsChatOpen(true)} />
        <Services />
        <FeaturedCars />
      </div>
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Index;
