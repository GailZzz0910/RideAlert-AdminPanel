import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Car,
  ChevronLeft,
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
import { useFleetVehicles } from "./utils/useFleetVehicle";
import { wsBaseURL, apiBaseURL } from "@/utils/api";

export default function SuperAdminCompanyDetails() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalVehiclesForFleet, setTotalVehiclesForFleet] = useState<number | null>(null);

  const fleetId = company?.fleet_id || companyId; // adjust based on your schema
  const { vehicles, loading: vehiclesLoading, error: vehiclesError } = useFleetVehicles(fleetId);

  const handleDeleteCompany = async () => {
    const id = company?._id || companyId;
    if (!id) return;

    if (!confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseURL}/fleets/${id}`, {
        method: "DELETE",
      });

      // Even if we get a CORS error, the deletion might have succeeded
      // We'll rely on the WebSocket update to confirm
      console.log("Delete request sent");

      // Show immediate feedback
      alert("Company deletion initiated...");

      // Wait a bit and navigate back
      setTimeout(() => {
        navigate("/super-admin");
      }, 1000);

    } catch (err) {
      console.error("Error in delete request:", err);

      // If it's a CORS error, the deletion might still have succeeded
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        console.log("CORS error, but deletion might have succeeded");
        alert("Company deletion initiated. Redirecting...");
        setTimeout(() => {
          navigate("/super-admin");
        }, 1000);
      } else {
        alert("Failed to delete company. Please try again.");
      }
    }
  };

  // Remove the HTTP request part and rely only on WebSocket
  useEffect(() => {
    let isMounted = true;
    let ws: WebSocket | null = null;

    if (!companyId) {
      setError("No company ID provided");
      setLoading(false);
      return;
    }

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`${wsBaseURL}/fleets/${companyId}/ws`);

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
              console.log("Company data received:", data);
              console.log("max_vehicles value:", data.max_vehicles);
              console.log("All company fields:", Object.keys(data));

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
            // When websocket disconnects we can also attempt to fetch counts via HTTP
            // (if company info was already set)
            if (company && company._id) {
              fetchFleetCounts(company._id);
            }
          }
        };
      } catch (err) {
        if (isMounted) {
          console.error("WebSocket connection failed:", err);
          setError("Company not found");
          setLoading(false);
        }
      }
    };

    // Start WebSocket connection
    connectWebSocket();

    return () => {
      isMounted = false;
      if (ws) {
        ws.close();
      }
    };
  }, [companyId]);

  // Fetch per-fleet counts and set the total for this company
  const fetchFleetCounts = async (fleetId: string) => {
    try {
      // Use the stats endpoint (non-conflicting)
      const res = await fetch(`${apiBaseURL}/vehicles/stats/counts`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        console.warn('vehicles/stats/counts response not ok', res.status);
        return;
      }
      const json = await res.json();
      if (json && Array.isArray(json.counts)) {
        const match = json.counts.find((c: any) => c.fleet_id === fleetId || c.fleet_id.endsWith(fleetId));
        if (match) {
          setTotalVehiclesForFleet(match.count);
          return;
        }
      }
      // fallback to vehicle list length (if any)
      setTotalVehiclesForFleet(null);
    } catch (err) {
      console.error('Failed to fetch fleet counts', err);
      setTotalVehiclesForFleet(null);
    }
  };

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
            <ChevronLeft className="w-4 h-4 mr-2" />
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
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 pt-8 mb-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/super-admin")}
              className="cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
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
                  <p className="text-sm text-muted-foreground">Total Vehicles</p>
                  <p className="text-2xl font-bold text-foreground">{totalVehiclesForFleet !== null ? totalVehiclesForFleet : vehicles.length}</p>
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
                  Fleet Vehicles ({vehicles.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {vehiclesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Car className="w-12 h-12 mb-2 opacity-50" />
                  <p>No vehicles registered yet</p>
                  <p className="text-sm">Vehicles will appear here once added</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{vehicle.plate}</p>
                          <p className="text-sm text-muted-foreground">
                            Driver: {vehicle.driverName || "N/A"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{vehicle.status}</Badge>
                          <Badge variant="outline">
                            {vehicle.available_seats} seats
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={handleDeleteCompany}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Company
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}