import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Fuel, Gauge, Calendar, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  year: string;
  km: string;
  fuel: string;
  location: string;
  description?: string;
  image_url?: string;
  phone?: string;
}

const sampleCars = [
  { id: "1", name: "Honda City VX", brand: "Honda", model: "City VX", price: 1250000, year: "2022", km: "15,000 km", fuel: "Petrol", location: "Mumbai, Maharashtra", image_url: car1 },
  { id: "2", name: "Hyundai Creta SX", brand: "Hyundai", model: "Creta SX", price: 1675000, year: "2023", km: "8,500 km", fuel: "Diesel", location: "Bangalore, Karnataka", image_url: car2 },
  { id: "3", name: "Maruti Swift ZXI", brand: "Maruti", model: "Swift ZXI", price: 725000, year: "2021", km: "22,000 km", fuel: "Petrol", location: "Delhi, NCR", image_url: car3 },
];

export const FeaturedCars = () => {
  const [cars, setCars] = useState<Car[]>(sampleCars);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data && data.length > 0) {
        setCars(data as Car[]);
      }
    } catch (error: any) {
      console.error("Error fetching cars:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="cars" className="py-20 bg-background">
      <div className="container px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Featured Cars</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verified listings from trusted sellers across India
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <Card 
              key={car.id}
              className="overflow-hidden hover:shadow-elegant transition-smooth hover:-translate-y-2 border-2"
            >
              <div className="relative h-56 overflow-hidden bg-muted">
                <img 
                  src={car.image_url || car1} 
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                  {car.year}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{car.name}</h3>
                <div className="text-3xl font-bold text-accent mb-4">{formatPrice(car.price)}</div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <Gauge className="h-4 w-4 mr-2" />
                    <span className="text-sm">{car.km}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Fuel className="h-4 w-4 mr-2" />
                    <span className="text-sm">{car.fuel}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{car.location}</span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => setSelectedCar(car)}
                    >
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{car.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="relative h-80 w-full overflow-hidden rounded-lg">
                        <img 
                          src={car.image_url || car1} 
                          alt={car.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-foreground">Car Details</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <Calendar className="h-5 w-5" />
                              <span>Year: {car.year}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <Gauge className="h-5 w-5" />
                              <span>Mileage: {car.km}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <Fuel className="h-5 w-5" />
                              <span>Fuel Type: {car.fuel}</span>
                            </div>
                            <div className="flex items-center gap-3 text-muted-foreground">
                              <MapPin className="h-5 w-5" />
                              <span>Location: {car.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-foreground">Pricing</h3>
                          <div className="text-4xl font-bold text-accent">{formatPrice(car.price)}</div>
                          <p className="text-sm text-muted-foreground">
                            {car.description || "Price negotiable. Contact seller for best deal."}
                          </p>
                          
                          <div className="pt-4 space-y-2">
                            {car.phone && (
                              <Button 
                                className="w-full bg-primary hover:bg-primary/90" 
                                size="lg"
                                onClick={() => window.open(`tel:${car.phone}`)}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                {car.phone}
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              size="lg"
                              onClick={() => {
                                toast({
                                  title: "Contact seller",
                                  description: car.phone || "Phone number not available",
                                });
                              }}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Request Callback
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 border-t pt-4">
                        <h3 className="text-xl font-semibold text-foreground">Key Features</h3>
                        <ul className="grid md:grid-cols-2 gap-2 text-muted-foreground">
                          <li>✓ Verified & Certified</li>
                          <li>✓ Complete Service History</li>
                          <li>✓ Single Owner</li>
                          <li>✓ Insurance Valid</li>
                          <li>✓ No Accident History</li>
                          <li>✓ RC Transfer Available</li>
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-2">
            View All Cars
          </Button>
        </div>
      </div>
    </section>
  );
};
