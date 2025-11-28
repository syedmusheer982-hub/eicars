import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Pencil, Trash2, Plus, Car, MapPin, Fuel, Calendar, Gauge } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CarListing {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  year: string;
  km: string;
  fuel: string;
  location: string;
  city: string;
  state: string;
  description: string | null;
  image_url: string | null;
  phone: string | null;
  status: string;
  created_at: string;
}

const MyListings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCar, setEditingCar] = useState<CarListing | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchListings(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchListings = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your listings",
        variant: "destructive",
      });
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (carId: string) => {
    const { error } = await supabase.from("cars").delete().eq("id", carId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    } else {
      setListings(listings.filter((car) => car.id !== carId));
      toast({
        title: "Deleted",
        description: "Your listing has been deleted successfully",
      });
    }
  };

  const handleEdit = (car: CarListing) => {
    setEditingCar(car);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;

    const { error } = await supabase
      .from("cars")
      .update({
        name: editingCar.name,
        brand: editingCar.brand,
        model: editingCar.model,
        price: editingCar.price,
        year: editingCar.year,
        km: editingCar.km,
        fuel: editingCar.fuel,
        location: editingCar.location,
        city: editingCar.city,
        state: editingCar.state,
        description: editingCar.description,
        phone: editingCar.phone,
        status: editingCar.status,
      })
      .eq("id", editingCar.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    } else {
      setListings(
        listings.map((car) => (car.id === editingCar.id ? editingCar : car))
      );
      setIsEditDialogOpen(false);
      toast({
        title: "Updated",
        description: "Your listing has been updated successfully",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 container px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 container px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your posted cars
            </p>
          </div>
          <Button onClick={() => navigate("/sell-car")} className="gap-2">
            <Plus className="h-4 w-4" />
            Post New Car
          </Button>
        </div>

        {listings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No listings yet
              </h3>
              <p className="text-muted-foreground mb-6">
                You haven't posted any cars for sale yet.
              </p>
              <Button onClick={() => navigate("/sell-car")}>
                Post Your First Car
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((car) => (
              <Card key={car.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {car.image_url ? (
                    <img
                      src={car.image_url}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <Badge
                    className={`absolute top-2 right-2 ${
                      car.status === "active"
                        ? "bg-green-500"
                        : "bg-muted-foreground"
                    }`}
                  >
                    {car.status}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{car.name}</CardTitle>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(car.price)}
                  </p>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {car.year}
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="h-4 w-4" />
                      {car.km} km
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-4 w-4" />
                      {car.fuel}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {car.city}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(car)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{car.name}"? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(car.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Listing</DialogTitle>
            </DialogHeader>
            {editingCar && (
              <form onSubmit={handleUpdateCar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Car Name</Label>
                    <Input
                      id="name"
                      value={editingCar.name}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editingCar.price}
                      onChange={(e) =>
                        setEditingCar({
                          ...editingCar,
                          price: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={editingCar.brand}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, brand: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={editingCar.model}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, model: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      value={editingCar.year}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, year: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="km">Kilometers</Label>
                    <Input
                      id="km"
                      value={editingCar.km}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, km: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuel">Fuel Type</Label>
                    <Select
                      value={editingCar.fuel}
                      onValueChange={(value) =>
                        setEditingCar({ ...editingCar, fuel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="CNG">CNG</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editingCar.status}
                      onValueChange={(value) =>
                        setEditingCar({ ...editingCar, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editingCar.city}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={editingCar.state}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, state: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="location">Full Address</Label>
                    <Input
                      id="location"
                      value={editingCar.location}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, location: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={editingCar.phone || ""}
                      onChange={(e) =>
                        setEditingCar({ ...editingCar, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingCar.description || ""}
                      onChange={(e) =>
                        setEditingCar({
                          ...editingCar,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyListings;
