import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from "lucide-react";
import heroImage from "@/assets/hero-cars.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeroProps {
  onOpenChat: () => void;
}

const carPlatforms = [
  { name: "Cars24", url: "https://www.cars24.com", logo: "🚗" },
  { name: "CarWale", url: "https://www.carwale.com", logo: "🚙" },
  { name: "Spinny", url: "https://www.spinny.com", logo: "🏎️" },
];

export const Hero = ({ onOpenChat }: HeroProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/60" />
      </div>
      
      <div className="container relative z-10 px-6">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in">
            India's AI-Powered Car Platform
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
            Buy, sell, and explore cars with intelligent AI assistance. Get instant recommendations, 
            price comparisons, and expert advice for your perfect vehicle.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              onClick={onOpenChat}
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow text-lg px-8 py-6 transition-smooth"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Ask AI Assistant
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-background/10 backdrop-blur-sm border-2 border-primary-foreground/30 text-primary-foreground hover:bg-background/20 text-lg px-8 py-6 transition-smooth"
                >
                  Browse Cars
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {carPlatforms.map((platform) => (
                  <DropdownMenuItem key={platform.name} asChild>
                    <a 
                      href={platform.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>{platform.logo}</span>
                        {platform.name}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-foreground">50K+</div>
              <div className="text-sm text-primary-foreground/80">Cars Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-foreground">25K+</div>
              <div className="text-sm text-primary-foreground/80">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-foreground">100+</div>
              <div className="text-sm text-primary-foreground/80">Cities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};