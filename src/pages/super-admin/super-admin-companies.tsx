import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Building,
  Users as UsersIcon,
  Car,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useAllFleetCompanies } from "./utils/useAllFleetCompanies";
import { apiBaseURL } from "@/utils/api";
import api from "@/utils/api";

// Skeleton components for loading states
const CompanyCardSkeleton = () => (
  <div className="animate-pulse">
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-muted rounded"></div>
            <div className="h-5 bg-muted rounded w-32"></div>
          </div>
          <div className="flex space-x-1">
            <div className="w-6 h-6 bg-muted rounded"></div>
            <div className="w-6 h-6 bg-muted rounded"></div>
          </div>
        </div>
        <div className="h-4 bg-muted/60 rounded w-48 mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted rounded w-16"></div>
          <div className="h-6 bg-muted rounded w-20"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <div>
              <div className="h-4 bg-muted rounded w-8 mb-1"></div>
              <div className="h-3 bg-muted/60 rounded w-12"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <div>
              <div className="h-4 bg-muted rounded w-8 mb-1"></div>
              <div className="h-3 bg-muted/60 rounded w-12"></div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <div className="h-3 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-12"></div>
          </div>
          <div className="w-full bg-muted rounded-full h-2"></div>
        </div>
        <div className="h-3 bg-muted/60 rounded w-24"></div>
      </CardContent>
    </Card>
  </div>
);

const SummaryCardSkeleton = () => (
  <div className="animate-pulse">
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg"></div>
          <div>
            <div className="h-3 bg-muted rounded w-16 mb-2"></div>
            <div className="h-6 bg-muted rounded w-8"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function CompanyManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fleets = useAllFleetCompanies();

  // WebSocket state
  const [verifiedVehicleCount, setVerifiedVehicleCount] = useState<number | null>(null);
  const [vehicleCountsByFleet, setVehicleCountsByFleet] = useState<Record<string, number>>({});
  const [totalStats, setTotalStats] = useState({
    total_vehicles: 0,
    total_users: 0,
    total_fleets: 0
  });

  // WebSocket refs
  const statsCountSocketRef = useRef<WebSocket | null>(null);
  const statsVerifiedSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getCompanyKey = (company: any, index: number) => {
    return company._id || company.id || `company-${index}`;
  };

  // WebSocket connection management
  const connectWebSockets = () => {
    // Close existing connections
    if (statsCountSocketRef.current) {
      statsCountSocketRef.current.close();
    }
    if (statsVerifiedSocketRef.current) {
      statsVerifiedSocketRef.current.close();
    }

    // Get WebSocket URL (convert http to ws)
    const wsBaseURL = apiBaseURL.replace('http', 'ws');

    // Connect to /stats/count WebSocket
    try {
      const countSocket = new WebSocket(`${wsBaseURL}/vehicles/stats/count`);
      statsCountSocketRef.current = countSocket;

      countSocket.onopen = () => {
        console.log('Connected to /stats/count WebSocket');
      };

      countSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'stats_count') {
            console.log('Received stats count update:', data.data);
            setTotalStats(data.data);
          }
        } catch (error) {
          console.error('Error parsing stats count message:', error);
        }
      };

      countSocket.onclose = (event) => {
        console.log('Disconnected from /stats/count WebSocket:', event.code, event.reason);
        // Attempt reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connectWebSockets, 5000);
      };

      countSocket.onerror = (error) => {
        console.error('WebSocket /stats/count error:', error);
      };
    } catch (error) {
      console.error('Failed to create /stats/count WebSocket:', error);
    }

    // Connect to /stats/verified WebSocket
    try {
      const verifiedSocket = new WebSocket(`${wsBaseURL}/vehicles/stats/verified`);
      statsVerifiedSocketRef.current = verifiedSocket;

      verifiedSocket.onopen = () => {
        console.log('Connected to /stats/verified WebSocket');
      };

      verifiedSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'stats_verified') {
            console.log('Received stats verified update:', data.data);
            setVerifiedVehicleCount(data.data.verified_vehicles);

            // Also update the vehicle counts by fleet when we get verified updates
            // We need to refetch the fleet counts since the verified count changed
            fetchVehicleCountsByFleet();
          }
        } catch (error) {
          console.error('Error parsing stats verified message:', error);
        }
      };

      verifiedSocket.onclose = (event) => {
        console.log('Disconnected from /stats/verified WebSocket:', event.code, event.reason);
        // Reconnect will be handled by the main reconnect timer
      };

      verifiedSocket.onerror = (error) => {
        console.error('WebSocket /stats/verified error:', error);
      };
    } catch (error) {
      console.error('Failed to create /stats/verified WebSocket:', error);
    }
  };

  // Fetch vehicle counts by fleet function
  const fetchVehicleCountsByFleet = async () => {
    try {
      const countsRes = await api.get(`${apiBaseURL}/vehicles/stats/counts-http`);
      console.debug("/vehicles/stats/counts response:", countsRes && countsRes.data);
      if (countsRes && countsRes.data && Array.isArray(countsRes.data.counts)) {
        const map: Record<string, number> = {};
        countsRes.data.counts.forEach((item: any) => {
          map[item.fleet_id] = item.count;
        });
        console.debug("constructed vehicleCountsByFleet map:", map);
        setVehicleCountsByFleet(map);
      }
    } catch (err) {
      console.error("Failed to load per-fleet vehicle counts:", err);
    }
  };

  // Send ping to keep connections alive
  const sendPing = () => {
    if (statsCountSocketRef.current?.readyState === WebSocket.OPEN) {
      statsCountSocketRef.current.send('ping');
    }
    if (statsVerifiedSocketRef.current?.readyState === WebSocket.OPEN) {
      statsVerifiedSocketRef.current.send('ping');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Connect WebSockets
    connectWebSockets();

    // Set up ping interval (every 30 seconds)
    const pingInterval = setInterval(sendPing, 30000);

    // Also fetch initial data via HTTP as fallback
    async function fetchInitialData() {
      try {
        // Fetch verified vehicle count
        const verifiedRes = await api.get(`${apiBaseURL}/vehicles/stats/verified-http`);
        if (mounted && verifiedRes && verifiedRes.data) {
          setVerifiedVehicleCount(verifiedRes.data.verified_vehicle_count ?? 0);
        }

        // Fetch per-fleet vehicle counts
        await fetchVehicleCountsByFleet();
        
        if (mounted) {
          setLoading(false); // Data loaded, stop loading
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        if (mounted) {
          setLoading(false); // Even on error, stop loading
        }
      }
    }

    fetchInitialData();

    return () => {
      mounted = false;

      // Cleanup
      if (statsCountSocketRef.current) {
        statsCountSocketRef.current.close();
      }
      if (statsVerifiedSocketRef.current) {
        statsVerifiedSocketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(pingInterval);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    // Connect WebSockets
    connectWebSockets();

    // Set up ping interval (every 30 seconds)
    const pingInterval = setInterval(sendPing, 30000);

    // Also fetch initial data via HTTP as fallback
    async function fetchInitialData() {
      try {
        // Fetch verified vehicle count
        const verifiedRes = await api.get(`${apiBaseURL}/vehicles/stats/verified-http`);
        if (mounted && verifiedRes && verifiedRes.data) {
          setVerifiedVehicleCount(verifiedRes.data.verified_vehicle_count ?? 0);
        }

        // Fetch per-fleet vehicle counts
        const countsRes = await api.get(`${apiBaseURL}/vehicles/stats/counts-http`);
        console.debug("/vehicles/stats/counts response:", countsRes && countsRes.data);
        if (countsRes && countsRes.data && Array.isArray(countsRes.data.counts)) {
          const map: Record<string, number> = {};
          countsRes.data.counts.forEach((item: any) => {
            map[item.fleet_id] = item.count;
          });
          console.debug("constructed vehicleCountsByFleet map:", map);
          if (mounted) setVehicleCountsByFleet(map);
        }
        
        if (mounted) {
          setLoading(false); // Data loaded, stop loading
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        if (mounted) {
          setLoading(false); // Even on error, stop loading
        }
      }
    }

    fetchInitialData();

    return () => {
      mounted = false;

      // Cleanup
      if (statsCountSocketRef.current) {
        statsCountSocketRef.current.close();
      }
      if (statsVerifiedSocketRef.current) {
        statsVerifiedSocketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      clearInterval(pingInterval);
    };
  }, []);

  const handleDeleteCompany = async (companyId: string) => {
    if (deleting) return; // Prevent multiple deletions
    
    try {
      setDeleting(companyId);
      
      const response = await fetch(`${apiBaseURL}/fleets/${companyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Company deleted successfully");
        // Refresh list by filtering it locally
        // (since useAllFleetCompanies probably comes from websocket or hook)
        // if it's websocket-driven, the broadcast will update automatically.
      } else if (response.status === 404) {
        alert("Company not found");
      } else {
        throw new Error(`Delete failed: ${response.status}`);
      }
    } catch (err) {
      console.error("Error deleting company:", err);
      alert("Failed to delete company. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handleEditCompany = (company: any) => {
    setSelectedCompany(company);
    setEditForm({
      name: company.name,
      contactEmail: company.contactEmail,
      status: company.status,
      plan: company.plan,
    });
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    // Update the company in local state
    // In a real app, this would make an API call
    console.log("Saving company changes:", editForm);

    // Update selectedCompany to reflect changes
    setSelectedCompany({
      ...selectedCompany,
      name: editForm.name,
      contactEmail: editForm.contactEmail,
      status: editForm.status,
      plan: editForm.plan,
    });

    setIsEditMode(false);
    alert("Company updated successfully!");
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm({});
  };

  const filteredCompanies = fleets.filter((company: any) => {
    // First, filter by role 'admin'
    if (company.role !== 'admin') {
      return false;
    }

    const matchesSearch =
      company.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      company.contactEmail?.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && company.status === "active") ||
      (filterStatus === "inactive" && company.status === "inactive");

    return matchesSearch && matchesFilter;
  });

  const totalAdminCompanies = fleets.filter((c: any) => c.role === 'admin').length;
  const activeAdminCompanies = fleets.filter((c: any) => c.role === 'admin' && c.status === 'active').length;
  const inactiveAdminCompanies = fleets.filter((c: any) => c.role === 'admin' && c.status === 'inactive').length;
  // Total vehicles should only include verified/approved companies.
  // Here we treat a verified company as one with role === 'admin' and status === 'active'.
  // If your backend exposes a different verification flag (e.g. `verified`), switch the filter accordingly.
  const totalAdminVehicles = fleets
    .filter((c: any) => c.role === 'admin' && c.status === 'active')
    .reduce((total: number, company: any) => total + (company.vehiclesCount || 0), 0);

  // Helper to resolve vehicle count for a company robustly
  const getVehicleCountForCompany = (company: any) => {
    const possibleKeys = [company.id, company._id, company._id?.toString(), company.id?.toString()];
    // Try direct lookup first
    for (const k of possibleKeys) {
      if (k && vehicleCountsByFleet[k] !== undefined) return vehicleCountsByFleet[k];
    }

    // Fallback: attempt to find a map key that endsWith the company id
    const idStr = (company.id || company._id || "").toString();
    if (idStr) {
      for (const key of Object.keys(vehicleCountsByFleet)) {
        if (key === idStr) return vehicleCountsByFleet[key];
        if (key.endsWith(idStr)) return vehicleCountsByFleet[key];
      }
    }

    // Nothing found — fall back to the fleet's vehiclesCount (max_vehicles)
    // If the server didn't provide an actual vehicle count, treat it as 0 (don't use plan max_vehicles)
    if (company.vehiclesCount !== undefined && company.vehiclesCount !== null) {
      return company.vehiclesCount;
    }
    return 0;
  };

  const getStatusColor = (status: string) =>
    status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

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
      minute: "2-digit",
    });
  };

  const formatTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 pt-8 mb-10">

        <h1 className="text-3xl font-bold text-foreground">Approved Companies</h1>
        <p className="text-muted-foreground">Oversee the approved companies and manage them.</p>

        {/* WebSocket Connection Status
        <div className="flex gap-2 text-sm">
          <div className={`flex items-center gap-1 ${statsCountSocketRef.current?.readyState === WebSocket.OPEN ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${statsCountSocketRef.current?.readyState === WebSocket.OPEN ? 'bg-green-500' : 'bg-red-500'}`} />
            Stats Count: {statsCountSocketRef.current?.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected'}
          </div>
          <div className={`flex items-center gap-1 ${statsVerifiedSocketRef.current?.readyState === WebSocket.OPEN ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${statsVerifiedSocketRef.current?.readyState === WebSocket.OPEN ? 'bg-green-500' : 'bg-red-500'}`} />
            Stats Verified: {statsVerifiedSocketRef.current?.readyState === WebSocket.OPEN ? 'Connected' : 'Disconnected'}
          </div>
        </div> */}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loading ? (
            <>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Companies</p>
                      <p className="text-2xl font-bold text-foreground">{totalAdminCompanies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold text-foreground">
                        {activeAdminCompanies}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inactive</p>
                      <p className="text-2xl font-bold text-foreground">
                        {inactiveAdminCompanies}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Vehicles</p>
                      <p className="text-2xl font-bold text-foreground">
                        {verifiedVehicleCount !== null ? verifiedVehicleCount : '...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies by name or email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Companies {!loading && `(${filteredCompanies.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vehicles</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date Approved</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <CompanyCardSkeleton />
                          <CompanyCardSkeleton />
                          <CompanyCardSkeleton />
                          <CompanyCardSkeleton />
                          <CompanyCardSkeleton />
                          <CompanyCardSkeleton />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((company: any, index: number) => (
                    <tr
                      key={getCompanyKey(company, index)}
                      className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedCompany(company)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{company.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{company.contactEmail}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(company.status)}>
                          <div className="flex items-center gap-1">
                            {company.status === "active" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            {company.status?.charAt(0).toUpperCase() + company.status?.slice(1)}
                          </div>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getPlanColor(company.plan)}>
                          {company.plan}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{getVehicleCountForCompany(company)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">
                            {company.approved_in ? formatDate(company.approved_in) : (company.createdAt ? formatDate(company.createdAt) : "N/A")}
                          </span>
                          {(company.approved_in || company.createdAt) && (
                            <span className="text-xs text-muted-foreground">
                              {formatTimeSince(company.approved_in || company.createdAt)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            disabled={updating || deleting === (company._id || company.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCompany(company);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer text-red-600 hover:text-red-700"
                                disabled={updating || deleting === (company._id || company.id)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                }}
                              >
                                {deleting === (company._id || company.id) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete company "{company.name}"?
                                  This action cannot be undone and will permanently remove the company and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel 
                                  disabled={deleting === (company._id || company.id)}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleting === (company._id || company.id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleDeleteCompany(company._id || company.id);
                                  }}
                                >
                                  {deleting === (company._id || company.id) ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete Company'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filteredCompanies.length === 0 && (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No companies found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchValue || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No companies available at the moment."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Details Dialog */}
        <Dialog
          open={selectedCompany !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedCompany(null);
              setIsEditMode(false);
              setEditForm({});
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedCompany && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {isEditMode ? `Edit Company - ${selectedCompany.name}` : `Company Details - ${selectedCompany.name}`}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode ? "Edit company information" : "Complete information about this company"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Company Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Company Name</span>
                          {isEditMode ? (
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedCompany.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Contact Email</span>
                          {isEditMode ? (
                            <Input
                              value={editForm.contactEmail}
                              onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedCompany.contactEmail}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Total Vehicles</span>
                          <p className="font-medium">{getVehicleCountForCompany(selectedCompany)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Created Date</span>
                          <p className="font-medium">
                            {selectedCompany.createdAt ? formatDate(selectedCompany.createdAt) : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status and Plan Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Status & Plan Information</h3>
                    {isEditMode ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="status">Company Status</Label>
                          <Select
                            value={editForm.status}
                            onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="plan">Subscription Plan</Label>
                          <Select
                            value={editForm.plan}
                            onValueChange={(value) => setEditForm({ ...editForm, plan: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard">Basic</SelectItem>
                              <SelectItem value="Premium">Premium</SelectItem>
                              <SelectItem value="Enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          {selectedCompany.status === "active" ? (
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                          <div>
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge className={getStatusColor(selectedCompany.status)}>
                              {selectedCompany.status?.charAt(0).toUpperCase() + selectedCompany.status?.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-sm text-muted-foreground">Plan</span>
                            <Badge className={getPlanColor(selectedCompany.plan)}>
                              {selectedCompany.plan}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {isEditMode ? (
                      <>
                        <Button
                          className="flex-1 cursor-pointer"
                          onClick={handleSaveEdit}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 cursor-pointer"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setEditForm({
                              name: selectedCompany.name,
                              contactEmail: selectedCompany.contactEmail,
                              status: selectedCompany.status,
                              plan: selectedCompany.plan,
                            });
                            setIsEditMode(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Company
                        </Button>

                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
}