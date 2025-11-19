import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Fuel, Gauge, Calendar, Phone, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";

const cars = [
  {
    id: 1,
    name: "Honda City VX",
    price: "₹12,50,000",
    year: "2022",
    km: "15,000 km",
    fuel: "Petrol",
    location: "Mumbai, Maharashtra",
    image: car1,
  },
  {
    id: 2,
    name: "Hyundai Creta SX",
    price: "₹16,75,000",
    year: "2023",
    km: "8,500 km",
    fuel: "Diesel",
    location: "Bangalore, Karnataka",
    image: car2,
  },
  {
    id: 3,
    name: "Maruti Swift ZXI",
    price: "₹7,25,000",
    year: "2021",
    km: "22,000 km",
    fuel: "Petrol",
    location: "Delhi, NCR",
    image: car3,
  },
];

export const FeaturedCars = () => {
  const [selectedCar, setSelectedCar] = useState<typeof cars[0] | null>(null);

  return (
    <section className="py-20 bg-background">
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
                  src={car.image} 
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                  {car.year}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{car.name}</h3>
                <div className="text-3xl font-bold text-accent mb-4">{car.price}</div>
                
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
                          src={car.image} 
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
                          <div className="text-4xl font-bold text-accent">{car.price}</div>
                          <p className="text-sm text-muted-foreground">
                            Price negotiable. Contact seller for best deal.
                          </p>
                          
                          <div className="pt-4 space-y-2">
                            <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Seller
                            </Button>
                            <Button variant="outline" className="w-full" size="lg">
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
