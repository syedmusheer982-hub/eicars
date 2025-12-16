import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import heroImage from "@/assets/hero-cars.jpg";
import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";
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

const heroSlides = [heroImage, car1, car2, car3];

export const Hero = ({ onOpenChat }: HeroProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      setMouseX(x);
      
      // Change slide based on mouse position (divide screen into sections)
      const slideIndex = Math.min(Math.floor(x * heroSlides.length), heroSlides.length - 1);
      setCurrentSlide(slideIndex);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden cursor-none"
    >
      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-accent w-8' 
                : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'
            }`}
          />
        ))}
      </div>

      {/* Background slides */}
      {heroSlides.map((slide, index) => (
        <div 
          key={index}
          className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-700 ease-out"
          style={{ 
            backgroundImage: `url(${slide})`,
            opacity: currentSlide === index ? 1 : 0,
            transform: `scale(${currentSlide === index ? 1.05 : 1}) translateX(${(mouseX - 0.5) * -20}px)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-emerald-950/85 to-emerald-900/70" />
        </div>
      ))}

      
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