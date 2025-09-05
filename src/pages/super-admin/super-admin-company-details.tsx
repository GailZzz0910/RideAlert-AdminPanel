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

export default function SuperAdminCompanyDetails() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!companyId) {
      setError("No company ID provided");
      setLoading(false);
      return;
    }

    // Try HTTP request first since it's more reliable
    const fetchCompanyHTTP = async () => {
      try {
        console.log("Fetching company with ID:", companyId);
        const response = await fetch(`http://localhost:8000/fleets/${companyId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Received company data via HTTP:", data);
          if (isMounted) {
            setCompany(data);
            setLoading(false);
          }
        } else if (response.status === 404) {
          if (isMounted) {
            setError("Company not found");
            setLoading(false);
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        if (isMounted) {
          console.error("HTTP request failed:", err);
          // Try WebSocket as fallback
          tryWebSocket();
        }
      }
    };

    // WebSocket fallback function
    const tryWebSocket = () => {
      let ws: WebSocket | null = null;
      
      try {
        ws = new WebSocket(`ws://localhost:8000/fleets/${companyId}/ws`);

        ws.onopen = () => {
          if (isMounted) {
            console.log("Connected to company details WebSocket");
          }
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            console.log("Received company data via WebSocket:", data);
            
            if (data.error) {
              setError(data.error);
              setLoading(false);
            } else {
              setCompany(data);
              setLoading(false);
            }
          } catch (err) {
            console.error("Error parsing WebSocket message", err);
            setError("Failed to parse company data");
            setLoading(false);
          }
        };

        ws.onerror = (err) => {
          if (isMounted) {
            console.error("WebSocket error", err);
            setError("Failed to connect to server");
            setLoading(false);
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            console.log("Company details WebSocket disconnected");
          }
        };
      } catch (err) {
        if (isMounted) {
          console.error("WebSocket connection failed:", err);
          setError("Company not found");
          setLoading(false);
        }
      }

      // Cleanup function for WebSocket
      return () => {
        if (ws) {
          ws.close();
        }
      };
    };

    // Start with HTTP request
    fetchCompanyHTTP();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const getStatusColor = (status: boolean | string) => {
    // Handle both boolean and string status
    const isActive = typeof status === 'boolean' ? status : status === 'active';
    return isActive 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "enterprise": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "premium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "standard": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "basic": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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

  const getContactInfo = () => {
    if (company?.contact_info && company.contact_info.length > 0) {
      return company.contact_info[0];
    }
    return {
      email: "N/A",
      phone: "N/A",
      address: "N/A"
    };
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

  if (error || !company) {
    return (
      <ScrollArea className="h-screen w-full bg-background">
        <div className="flex flex-col items-center justify-center h-[400px] w-full">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            {error || "Company Not Found"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {error || "The requested company could not be found."}
          </p>
          <Button onClick={() => navigate("/super-admin")} className="cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </ScrollArea>
    );
  }

  const contactInfo = getContactInfo();
  const statusText = company.is_active ? "Active" : "Inactive";

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
                {company.company_name}
              </h1>
              <p className="text-muted-foreground">Company Details & Fleet Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(company.is_active)}>
              {statusText}
            </Badge>
            <Badge className={getPlanColor(company.subscription_plan)}>
              {company.subscription_plan || 'Basic'}
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
                  <p className="text-sm text-muted-foreground">Max Vehicles</p>
                  <p className="text-2xl font-bold text-foreground">{company.max_vehicles || 0}</p>
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
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="text-2xl font-bold text-foreground capitalize">{company.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company Code</p>
                  <p className="text-lg font-bold text-foreground">{company.company_code}</p>
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
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-lg font-bold text-foreground">
                    {company.created_at 
                      ? new Date(company.created_at).toLocaleDateString("en-US", { 
                          month: "short", 
                          year: "numeric" 
                        })
                      : "N/A"
                    }
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
                  <p className="font-medium">{contactInfo.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{contactInfo.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{contactInfo.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {company.last_updated ? formatDate(company.last_updated) : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fleet Vehicles - Placeholder since we don't have vehicle data yet */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Fleet Vehicles (0)
                </CardTitle>
                <Button size="sm" className="cursor-pointer">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Car className="w-12 h-12 mb-2 opacity-50" />
                <p>No vehicles registered yet</p>
                <p className="text-sm">Vehicles will appear here once added to the fleet</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center gap-4">
          <Button variant="outline" className="cursor-pointer">
            <Edit className="w-4 h-4 mr-2" />
            Edit Company
          </Button>
          <Button variant="outline" className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Manage Settings
          </Button>
          <Button variant="destructive" className="cursor-pointer">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Company
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}