// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Search, Plus, Edit, Trash2, Building, Users as UsersIcon, Car } from "lucide-react";
// import { useState } from "react";

// // Mock data for companies - replace with real API calls later
// const mockCompanies = [
//   { 
//     id: 1, 
//     name: "City Transport Co.", 
//     contactEmail: "admin@citytransport.com",
//     vehicles: 45, 
//     users: 12, 
//     status: "active", 
//     plan: "Premium",
//     createdAt: "2024-01-15",
//     maxVehicles: 50
//   },
//   { 
//     id: 2, 
//     name: "Metro Bus Lines", 
//     contactEmail: "contact@metrobus.com",
//     vehicles: 32, 
//     users: 8, 
//     status: "active", 
//     plan: "Standard",
//     createdAt: "2024-02-20",
//     maxVehicles: 40
//   },
//   { 
//     id: 3, 
//     name: "Urban Mobility Inc.", 
//     contactEmail: "info@urbanmobility.com",
//     vehicles: 28, 
//     users: 6, 
//     status: "active", 
//     plan: "Premium",
//     createdAt: "2024-03-10",
//     maxVehicles: 35
//   },
//   { 
//     id: 4, 
//     name: "Express Transit", 
//     contactEmail: "support@expresstransit.com",
//     vehicles: 67, 
//     users: 18, 
//     status: "active", 
//     plan: "Enterprise",
//     createdAt: "2023-11-05",
//     maxVehicles: 100
//   },
//   { 
//     id: 5, 
//     name: "Quick Ride Services", 
//     contactEmail: "hello@quickride.com",
//     vehicles: 23, 
//     users: 5, 
//     status: "inactive", 
//     plan: "Basic",
//     createdAt: "2024-04-18",
//     maxVehicles: 25
//   },
// ];

// export default function CompanyManagement() {
//   const [searchValue, setSearchValue] = useState("");

//   const filteredCompanies = mockCompanies.filter((company) =>
//     company.name.toLowerCase().includes(searchValue.toLowerCase()) ||
//     company.contactEmail.toLowerCase().includes(searchValue.toLowerCase())
//   );

//   const getStatusColor = (status: string) => {
//     return status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
//   };

//   const getPlanColor = (plan: string) => {
//     switch (plan) {
//       case "Enterprise": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
//       case "Premium": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
//       case "Standard": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
//       default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
//     }
//   };

//   return (
//     <ScrollArea className="h-screen w-full">
//       <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <h1 className="text-2xl font-bold text-foreground">Company Management</h1>
//           <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
//             <Plus className="w-4 h-4" />
//             Add Company
//           </button>
//         </div>

//         {/* Search */}
//         <div className="relative max-w-md">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search companies..."
//             value={searchValue}
//             onChange={(e) => setSearchValue(e.target.value)}
//             className="bg-card w-full pl-10 pr-4 py-2 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//           />
//         </div>

//         {/* Companies Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredCompanies.map((company) => (
//             <Card key={company.id} className="hover:shadow-lg transition-all duration-200">
//               <CardHeader className="pb-3">
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-center space-x-2">
//                     <Building className="w-5 h-5 text-primary" />
//                     <CardTitle className="text-lg">{company.name}</CardTitle>
//                   </div>
//                   <div className="flex space-x-1">
//                     <button className="p-1 hover:bg-muted rounded">
//                       <Edit className="w-4 h-4 text-muted-foreground" />
//                     </button>
//                     <button className="p-1 hover:bg-muted rounded">
//                       <Trash2 className="w-4 h-4 text-muted-foreground" />
//                     </button>
//                   </div>
//                 </div>
//                 <p className="text-sm text-muted-foreground">{company.contactEmail}</p>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {/* Status and Plan */}
//                 <div className="flex items-center justify-between">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
//                     {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
//                   </span>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(company.plan)}`}>
//                     {company.plan}
//                   </span>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="flex items-center space-x-2">
//                     <Car className="w-4 h-4 text-muted-foreground" />
//                     <div>
//                       <p className="text-sm font-medium">{company.vehicles}</p>
//                       <p className="text-xs text-muted-foreground">Vehicles</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <UsersIcon className="w-4 h-4 text-muted-foreground" />
//                     <div>
//                       <p className="text-sm font-medium">{company.users}</p>
//                       <p className="text-xs text-muted-foreground">Users</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Vehicle Usage */}
//                 <div>
//                   <div className="flex justify-between text-xs text-muted-foreground mb-1">
//                     <span>Vehicle Usage</span>
//                     <span>{company.vehicles}/{company.maxVehicles}</span>
//                   </div>
//                   <div className="w-full bg-muted rounded-full h-2">
//                     <div 
//                       className="bg-primary h-2 rounded-full transition-all duration-300" 
//                       style={{ width: `${(company.vehicles / company.maxVehicles) * 100}%` }}
//                     />
//                   </div>
//                 </div>

//                 {/* Created Date */}
//                 <p className="text-xs text-muted-foreground">
//                   Created: {new Date(company.createdAt).toLocaleDateString()}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>

//         {filteredCompanies.length === 0 && (
//           <div className="flex items-center justify-center h-40 text-muted-foreground text-lg font-medium">
//             No companies found
//           </div>
//         )}
//       </div>
//     </ScrollArea>
//   );
// }


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
  Mail
} from "lucide-react";
import { useState, useEffect } from "react";
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

export default function CompanyManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const fleets = useAllFleetCompanies();

  const getCompanyKey = (company: any, index: number) => {
    return company._id || company.id || `company-${index}`;
  };


  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      return;
    }

    try {
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

  const [verifiedVehicleCount, setVerifiedVehicleCount] = useState<number | null>(null);
  const [vehicleCountsByFleet, setVehicleCountsByFleet] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    async function fetchVerifiedVehicleCount() {
      try {
  const res = await api.get(`${apiBaseURL}/vehicles/stats/verified`);
        if (mounted && res && res.data) {
          setVerifiedVehicleCount(res.data.verified_vehicle_count ?? 0);
        }
      } catch (err) {
        console.error("Failed to load verified vehicle count:", err);
        if (mounted) setVerifiedVehicleCount(0);
      }
    }
    fetchVerifiedVehicleCount();
    // Also fetch per-fleet vehicle counts
    async function fetchVehicleCountsByFleet() {
      try {
  const res = await api.get(`${apiBaseURL}/vehicles/stats/counts`);
        console.debug("/vehicles/stats/counts response:", res && res.data);
        if (res && res.data && Array.isArray(res.data.counts)) {
          const map: Record<string, number> = {};
          res.data.counts.forEach((item: any) => {
            map[item.fleet_id] = item.count;
          });
          console.debug("constructed vehicleCountsByFleet map:", map);
          console.debug("fleet ids from frontend fleets:", fleets.map((f:any)=>f.id || f._id));
          if (mounted) setVehicleCountsByFleet(map);
        }
      } catch (err) {
        console.error("Failed to load per-fleet vehicle counts:", err);
      }
    }
    fetchVehicleCountsByFleet();
    return () => { mounted = false; };
  }, []);

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
    return company.vehiclesCount || 0;
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
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">

        <h1 className="text-3xl font-bold text-foreground">Approved Companies</h1>
            <p className="text-muted-foreground">Oversee the approved companies and manage them.</p>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    {verifiedVehicleCount !== null ? verifiedVehicleCount : totalAdminVehicles}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
              Companies ({filteredCompanies.length})
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
                  {filteredCompanies.map((company: any, index: number) => (
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
                            {company.createdAt ? formatDate(company.createdAt) : "N/A"}
                          </span>
                          {company.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatTimeSince(company.createdAt)}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete company "{company.name}"?
                                  This action cannot be undone and will permanently remove the company and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteCompany(company._id || company.id)}
                                >
                                  Delete Company
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCompanies.length === 0 && (
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
                              <SelectItem value="Basic">Basic</SelectItem>
                              <SelectItem value="Standard">Standard</SelectItem>
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
