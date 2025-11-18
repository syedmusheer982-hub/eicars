import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.png";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b">
      <div className="container px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="EI CAR'S Logo" className="w-10 h-10 rounded-lg object-cover" />
            <span className="text-2xl font-bold text-foreground">EI CAR'S</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">
              Buy Cars
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">
              Sell Car
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">
              Car Loans
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-smooth font-medium">
              Car Check
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:inline-flex">
              Sign In
            </Button>
            <Button className="bg-accent hover:bg-accent/90">
              List Your Car
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
