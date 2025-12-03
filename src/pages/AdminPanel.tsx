import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Eye, Search, ShieldAlert, Car, Users } from "lucide-react";

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
  status: string;
  description: string | null;
  image_url: string | null;
  phone: string | null;
  user_id: string;
  created_at: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingCar, setEditingCar] = useState<CarListing | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllCars();
    }
  }, [isAdmin]);

  const fetchAllCars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCars(data || []);
    } catch (err) {
      console.error("Error fetching cars:", err);
      toast({
        title: "Error",
        description: "Failed to load car listings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (carId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("cars")
        .update({ status: newStatus })
        .eq("id", carId);

      if (error) throw error;

      setCars(cars.map(car => 
        car.id === carId ? { ...car, status: newStatus } : car
      ));

      toast({
        title: "Status Updated",
        description: `Car status changed to ${newStatus}.`,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (carId: string) => {
    try {
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("id", carId);

      if (error) throw error;

      setCars(cars.filter(car => car.id !== carId));
      toast({
        title: "Deleted",
        description: "Car listing has been deleted.",
      });
    } catch (err) {
      console.error("Error deleting car:", err);
      toast({
        title: "Error",
        description: "Failed to delete car listing.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;

    try {
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
          image_url: editingCar.image_url,
          status: editingCar.status,
        })
        .eq("id", editingCar.id);

      if (error) throw error;

      setCars(cars.map(car => 
        car.id === editingCar.id ? editingCar : car
      ));

      setIsEditDialogOpen(false);
      setEditingCar(null);

      toast({
        title: "Updated",
        description: "Car listing has been updated.",
      });
    } catch (err) {
      console.error("Error updating car:", err);
      toast({
        title: "Error",
        description: "Failed to update car listing.",
        variant: "destructive",
      });
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || car.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{cars.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-green-600">
                  {cars.filter(c => c.status === "active").length}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-blue-600">
                  {cars.filter(c => c.status === "sold").length}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-muted-foreground">
                  {cars.filter(c => c.status === "inactive").length}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, brand, model, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Cars Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCars.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No car listings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCars.map((car) => (
                        <TableRow key={car.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {car.image_url && (
                                <img 
                                  src={car.image_url} 
                                  alt={car.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium">{car.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {car.brand} {car.model} • {car.year}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ₹{car.price.toLocaleString()}
                          </TableCell>
                          <TableCell>{car.city}, {car.state}</TableCell>
                          <TableCell>
                            <Select
                              value={car.status}
                              onValueChange={(value) => handleStatusChange(car.id, value)}
                            >
                              <SelectTrigger className="w-[110px]">
                                <Badge 
                                  variant={
                                    car.status === "active" ? "default" : 
                                    car.status === "sold" ? "secondary" : "outline"
                                  }
                                >
                                  {car.status}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="sold">Sold</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(car.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingCar(car);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{car.name}"? This action cannot be undone.
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Car Listing</DialogTitle>
          </DialogHeader>
          {editingCar && (
            <form onSubmit={handleUpdateCar} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingCar.name}
                    onChange={(e) => setEditingCar({ ...editingCar, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={editingCar.brand}
                    onChange={(e) => setEditingCar({ ...editingCar, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={editingCar.model}
                    onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={editingCar.year}
                    onChange={(e) => setEditingCar({ ...editingCar, year: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingCar.price}
                    onChange={(e) => setEditingCar({ ...editingCar, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="km">Kilometers</Label>
                  <Input
                    id="km"
                    value={editingCar.km}
                    onChange={(e) => setEditingCar({ ...editingCar, km: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel">Fuel Type</Label>
                  <Input
                    id="fuel"
                    value={editingCar.fuel}
                    onChange={(e) => setEditingCar({ ...editingCar, fuel: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingCar.status}
                    onValueChange={(value) => setEditingCar({ ...editingCar, status: value })}
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
                    onChange={(e) => setEditingCar({ ...editingCar, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={editingCar.state}
                    onChange={(e) => setEditingCar({ ...editingCar, state: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Full Location</Label>
                  <Input
                    id="location"
                    value={editingCar.location}
                    onChange={(e) => setEditingCar({ ...editingCar, location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editingCar.phone || ""}
                    onChange={(e) => setEditingCar({ ...editingCar, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={editingCar.image_url || ""}
                  onChange={(e) => setEditingCar({ ...editingCar, image_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingCar.description || ""}
                  onChange={(e) => setEditingCar({ ...editingCar, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
