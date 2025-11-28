import { Button } from "@/components/ui/button";
import { Menu, LogOut, Plus } from "lucide-react";
import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";

export const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const handlePostCar = () => {
    if (user) {
      navigate("/sell-car");
    } else {
      navigate("/auth");
      toast({
        title: "Login Required",
        description: "Please login to post your car.",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b">
      <div className="container px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="EI CAR'S Logo" className="w-10 h-10 rounded-lg object-cover" />
            <span className="text-2xl font-bold text-foreground">EI CAR'S</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <a href="/#cars" className="text-foreground hover:text-accent transition-smooth">Buy</a>
            
            <Button 
              onClick={handlePostCar}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="h-4 w-4" />
              Post Your Car
            </Button>
            
            {user ? (
              <Button variant="ghost" size="icon" title="Logout" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate("/auth")}>Login</Button>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Button 
              size="sm"
              onClick={handlePostCar}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
            >
              <Plus className="h-4 w-4" />
              Post
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};