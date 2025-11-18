import { Car, HandCoins, Calculator, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Car,
    title: "Buy Used Cars",
    description: "Browse verified listings from across India. Get transparent pricing and detailed vehicle history.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: HandCoins,
    title: "Sell Your Car",
    description: "List your vehicle in minutes. Reach thousands of buyers and get the best price.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Calculator,
    title: "Car Loans",
    description: "Easy and fast loan assistance with competitive rates. Get approved quickly.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ClipboardCheck,
    title: "Car Check",
    description: "Complete vehicle verification including history, condition, and documentation.",
    color: "bg-accent/10 text-accent",
  },
];

export const Services = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete automotive solutions powered by AI technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index}
                className="border-2 hover:shadow-elegant transition-smooth hover:-translate-y-1"
              >
                <CardContent className="pt-6">
                  <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
