import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Car, 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  Plus,
  Eye,
  Settings,
  Activity,
  Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Mock data for company details - replace with real API calls later
const mockCompanyDetails = {
  1: {
    id: 1,
    name: "City Transport Co.",
    email: "admin@citytransport.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, New York, NY 10001",
    status: "active",
    plan: "Premium",
    vehicleCount: 45,
    userCount: 12,
    joinedDate: "2023-06-15",
    lastActivity: "2024-09-01T10:30:00Z",
    vehicles: [
      { id: 1, licensePlate: "NYC-001", model: "Ford Transit", year: 2022, status: "active", lastSeen: "2024-09-01T14:30:00Z" },
      { id: 2, licensePlate: "NYC-002", model: "Mercedes Sprinter", year: 2023, status: "active", lastSeen: "2024-09-01T12:15:00Z" },
      { id: 3, licensePlate: "NYC-003", model: "Iveco Daily", year: 2021, status: "maintenance", lastSeen: "2024-08-30T16:45:00Z" },
      { id: 4, licensePlate: "NYC-004", model: "Ford Transit", year: 2022, status: "active", lastSeen: "2024-09-01T13:20:00Z" },
      { id: 5, licensePlate: "NYC-005", model: "Mercedes Sprinter", year: 2023, status: "inactive", lastSeen: "2024-08-29T09:10:00Z" },
    ]
  },
  // Add more mock data for other companies as needed
};

export default function SuperAdminCompanyDetails() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      const companyData = mockCompanyDetails[Number(companyId) as keyof typeof mockCompanyDetails];
      setCompany(companyData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [companyId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "maintenance": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Enterprise": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Premium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Standard": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <ScrollArea className="h-screen w-full bg-background">
        <div className="flex items-center justify-center h-[400px] w-full">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ScrollArea>
    );
  }

  if (!company) {
    return (
      <ScrollArea className="h-screen w-full bg-background">
        <div className="flex flex-col items-center justify-center h-[400px] w-full">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">Company Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested company could not be found.</p>
          <Button onClick={() => navigate("/super-admin")} className="cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/super-admin")}
              className="cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Building className="w-6 h-6" />
                {company.name}
              </h1>
              <p className="text-muted-foreground">Company Details & Fleet Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(company.status)}>
              {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
            </Badge>
            <Badge className={getPlanColor(company.plan)}>
              {company.plan}
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Vehicles</p>
                  <p className="text-2xl font-bold text-foreground">{company.vehicleCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{company.userCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Vehicles</p>
                  <p className="text-2xl font-bold text-foreground">
                    {company.vehicles.filter((v: any) => v.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-lg font-bold text-foreground">
                    {new Date(company.joinedDate).toLocaleDateString("en-US", { 
                      month: "short", 
                      year: "numeric" 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{company.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{company.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{company.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Activity</p>
                  <p className="font-medium">{formatDate(company.lastActivity)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fleet Vehicles */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Fleet Vehicles ({company.vehicles.length})
                </CardTitle>
                <Button size="sm" className="cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {company.vehicles.map((vehicle: any) => (
                  <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(vehicle.status).includes('green') ? 'bg-green-500' : vehicle.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          <div>
                            <h4 className="font-semibold text-foreground">{vehicle.licensePlate}</h4>
                            <p className="text-sm text-muted-foreground">{vehicle.model} ({vehicle.year})</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge className={getStatusColor(vehicle.status)}>
                              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last seen: {formatDate(vehicle.lastSeen)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="cursor-pointer">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="cursor-pointer">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
