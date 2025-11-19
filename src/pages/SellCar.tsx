import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { User, Session } from "@supabase/supabase-js";
import { z } from "zod";

const carSchema = z.object({
  name: z.string().min(3, "Car name must be at least 3 characters"),
  brand: z.string().min(2, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.string().min(4, "Year is required"),
  price: z.number().positive("Price must be greater than 0"),
  km: z.string().min(1, "Mileage is required"),
  fuel: z.string().min(1, "Fuel type is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
});

const SellCar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to post a car.",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      year: formData.get("year") as string,
      price: parseFloat(formData.get("price") as string),
      km: formData.get("km") as string,
      fuel: formData.get("fuel") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      phone: formData.get("phone") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
    };

    try {
      carSchema.parse(data);

      const { error } = await supabase.from("cars").insert([
        {
          user_id: user.id,
          name: data.name,
          brand: data.brand,
          model: data.model,
          year: data.year,
          price: data.price,
          km: data.km,
          fuel: data.fuel,
          location: `${data.city}, ${data.state}`,
          city: data.city,
          state: data.state,
          phone: data.phone,
          description: data.description,
          image_url: data.imageUrl || null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Car listed successfully!",
        description: "Your car is now live on EI CAR'S.",
      });

      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to list car",
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container px-6 py-20">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Sell Your Car</CardTitle>
            <CardDescription>Fill in the details to list your car on EI CAR'S</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Car Name *</Label>
                <Input id="name" name="name" placeholder="Honda City VX" required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input id="brand" name="brand" placeholder="Honda" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input id="model" name="model" placeholder="City VX" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input id="year" name="year" type="text" placeholder="2023" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input id="price" name="price" type="number" placeholder="1250000" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="km">Mileage *</Label>
                  <Input id="km" name="km" placeholder="15,000 km" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel">Fuel Type *</Label>
                  <Select name="fuel" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="CNG">CNG</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" placeholder="Mumbai" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" name="state" placeholder="Maharashtra" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone *</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/car-image.jpg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell buyers about your car's features, condition, and why it's a great buy..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Listing your car..." : "List My Car"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellCar;
