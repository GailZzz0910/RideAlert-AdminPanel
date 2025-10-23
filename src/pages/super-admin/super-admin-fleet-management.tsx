import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Search,
  Filter,
  Check,
  X,
  Clock,
  Building,
  Mail,
  Phone,
  MapPin,
  User,
  Eye,
  Calendar,
  AlertCircle,
  Loader2,
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
import { useUser } from "@/context/userContext";
import { apiBaseURL } from "@/utils/api";
import { wsBaseURL } from "@/utils/api";

const plans = {
  basic: { name: "Basic", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  premium: { name: "Premium", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  enterprise: { name: "Enterprise", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" }
};

// Default plan info for when plan data is not available
const defaultPlan = {
  name: "Unknown",
  color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
};

export default function SuperAdminFleetManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [fleets, setFleets] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { token } = useUser();

  // Connect to the websocket
  useEffect(() => {
    const ws = new WebSocket(`${wsBaseURL}/fleets/ws/all`);

    ws.onopen = () => {
      console.log("Connected to fleets websocket");
      setLoading(false);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.fleets) {
        setFleets(data.fleets);
        setLoading(false);
      }
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setLoading(false);
    };
    ws.onclose = () => console.log("Disconnected from fleets websocket");

    return () => ws.close();
  }, []);

  // Map fleet role to registration status
  const getStatusFromRole = (role: string) => {
    switch (role) {
      case "unverified": return "pending";
      case "admin": return "approved";
      case "rejected": return "rejected";
      default: return "pending";
    }
  };

  // Extract contact info from contact_info array
  const extractContactInfo = (contactInfoArray: any[]) => {
    if (!Array.isArray(contactInfoArray) || contactInfoArray.length === 0) {
      return { contactName: "N/A", email: "N/A", phone: "N/A", address: "N/A" };
    }

    const contact = contactInfoArray[0]; // Use first contact
    return {
      contactName: contact.name || "N/A",
      email: contact.email || "N/A",
      phone: contact.phone || "N/A",
      address: contact.address || "N/A"
    };
  };

  // Transform fleet data to match registration format
  const transformedFleets = fleets.map(fleet => {
    const contactInfo = extractContactInfo(fleet.contact_info);
    const planKey = fleet.subscription_plan?.toLowerCase() || "basic";

    // Use your existing plan prices mapping
    const priceMap: Record<string, number> = {
      basic: 250,
      premium: 1000,
      enterprise: 2500
    };

    return {
      id: fleet.id,
      companyName: fleet.company_name,
      companyCode: fleet.company_code,
      contactInfo: contactInfo.contactName,
      email: contactInfo.email,
      phone: contactInfo.phone,
      address: contactInfo.address,
      selectedPlan: planKey,
      planPrice: fleet.plan_price ?? priceMap[planKey], // <-- Add this
      maxVehicles: fleet.max_vehicles,
      submittedAt: fleet.created_at,
      status: getStatusFromRole(fleet.role),
      isActive: fleet.is_active,
      lastUpdated: fleet.last_updated,
      approvedAt: fleet.role === "admin" ? fleet.last_updated : null,
      approvedBy: fleet.role === "admin" ? "Admin" : null,
      rejectedAt: fleet.role === "rejected" ? fleet.last_updated : null,
      rejectedBy: fleet.role === "rejected" ? "Admin" : null,
      pdf_files: fleet.pdf_files || []
    };
  });

  const allRegistrations = transformedFleets;

  // Replace the counts in the summary cards
  const pendingCount = allRegistrations.filter(f => f.status === "pending").length;
  const approvedCount = allRegistrations.filter(f => f.status === "approved").length;
  const rejectedCount = allRegistrations.filter(f => f.status === "rejected").length;
  const totalCount = allRegistrations.length;

  const filteredRegistrations = allRegistrations.filter((registration) => {
    const matchesSearch =
      (registration.companyName?.toLowerCase() || "").includes(searchValue.toLowerCase()) ||
      (registration.contactInfo?.toLowerCase() || "").includes(searchValue.toLowerCase()) ||
      (registration.email?.toLowerCase() || "").includes(searchValue.toLowerCase()) ||
      (registration.companyCode?.toLowerCase() || "").includes(searchValue.toLowerCase());

    const matchesFilter = filterStatus === "all" || registration.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Safe function to get plan info
  const getPlanInfo = (planKey: string) => {
    if (planKey && plans[planKey as keyof typeof plans]) {
      return plans[planKey as keyof typeof plans];
    }
    return defaultPlan;
  };

  const handleApprove = async (fleetId: string) => {
    if (!fleetId) return;

    setApproving(fleetId);
    try {
      const response = await fetch(`${apiBaseURL}/fleets/${fleetId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to approve fleet");

      const data = await response.json();
      console.log("Approved:", data);

      // Show success message with email status
      if (data.email_sent) {
        alert(`Fleet approved successfully! \nNotification email sent to ${data.company_email}`);
      } else {
        alert("Fleet approved successfully! \nNote: Could not send notification email.");
      }

      // Refresh the data or update UI as needed
    } catch (err) {
      console.error(err);
      alert("Error approving fleet");
    } finally {
      setApproving(null);
    }
  };


  const handleReject = async (fleetId: string) => {
    if (!fleetId) return;

    setRejecting(fleetId);
    try {
      const response = await fetch(`${apiBaseURL}/fleets/${fleetId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) throw new Error("Failed to reject fleet");

      const data = await response.json();
      console.log("Rejected:", data);

      // Show success message with email status
      if (data.email_sent) {
        alert(`Fleet rejected successfully! ❌\nNotification email sent to ${data.company_email}`);
      } else {
        alert("Fleet rejected successfully! ❌\nNote: Could not send notification email.");
      }

    } catch (err) {
      console.error(err);
      alert("Error rejecting fleet");
    } finally {
      setRejecting(null);
    }
  };

  const handleEditFleet = (fleet: any) => {
    setSelectedRegistration(fleet);
    setEditForm({
      companyName: fleet.companyName,
      companyCode: fleet.companyCode,
      contactInfo: fleet.contactInfo,
      email: fleet.email,
      phone: fleet.phone,
      address: fleet.address,
      selectedPlan: fleet.selectedPlan,
      maxVehicles: fleet.maxVehicles,
    });
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the fleet in local state
      setFleets(prev =>
        prev.map(fleet =>
          fleet.id === selectedRegistration.id
            ? {
              ...fleet,
              company_name: editForm.companyName,
              company_code: editForm.companyCode,
              contact_info: [{
                name: editForm.contactInfo,
                email: editForm.email,
                phone: editForm.phone,
                address: editForm.address
              }],
              subscription_plan: editForm.selectedPlan,
              max_vehicles: editForm.maxVehicles,
            }
            : fleet
        )
      );

      // Update selectedRegistration to reflect changes
      setSelectedRegistration({
        ...selectedRegistration,
        companyName: editForm.companyName,
        companyCode: editForm.companyCode,
        contactInfo: editForm.contactInfo,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        selectedPlan: editForm.selectedPlan,
        maxVehicles: editForm.maxVehicles,
      });

      setIsEditMode(false);
      alert("Fleet updated successfully!");
    } catch (error) {
      console.error("Error updating fleet:", error);
      alert("Failed to update fleet. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm({});
  };

  const handleDeleteFleet = (fleetId: string) => {
    // Since there's no backend, just show an alert
    alert(`Delete functionality not implemented yet for fleet ID: ${fleetId}`);
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

  const formatTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Skeleton components
  const SummaryCardSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div>
            <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TableSkeleton = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          <div className="w-40 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Business Permit</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Submitted</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="w-28 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-36 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-18 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 pt-8 mb-10">

        <h1 className="text-3xl font-bold text-foreground">Fleet Registration Requests</h1>
        <p className="text-muted-foreground">Manage fleet registrations. Accept or reject requests as needed.</p>

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
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-foreground">
                        {pendingCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold text-foreground">
                        {approvedCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-foreground">
                        {rejectedCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Pending Request</p>
                      <p className="text-2xl font-bold text-foreground">
                        {pendingCount}
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
              placeholder="Search by company, contact, or email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Registrations Table */}
        {loading ? (
          <TableSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Registration Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Business Permit</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((registration) => {
                    const planInfo = getPlanInfo(registration.selectedPlan);

                    return (
                      <tr
                        key={registration.id}
                        className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedRegistration(registration)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{registration.companyName || "N/A"}</span>
                            <span className="text-sm text-muted-foreground">{registration.companyCode || "N/A"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground">{registration.phone}</span>
                            <span className="text-xs text-muted-foreground">{registration.email || "N/A"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <Badge className={planInfo.color}>
                              {planInfo.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground mt-1">
                              ${registration.planPrice || 0}/month
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(registration.status)}>
                            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {registration.pdf_files && registration.pdf_files.length > 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                const file = registration.pdf_files[0];
                                window.open(`${apiBaseURL}/fleets/${registration.id}/pdf/${file.filename}`, "_blank");
                              }}
                            >
                              View PDF
                            </Button>
                          ) : (
                            <span className="text-m text-muted-foreground">No file</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground">{formatDate(registration.submittedAt)}</span>
                            <span className="text-xs text-muted-foreground">{formatTimeSince(registration.submittedAt)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">

                            {registration.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  disabled={approving === registration.id || rejecting === registration.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprove(registration.id);
                                  }}
                                  className="bg-green-600 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                >
                                  {approving === registration.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span className="text-sm text-white">Approving...</span>
                                    </>
                                  ) : (
                                    <p className="text-sm text-white">Accept</p>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={approving === registration.id || rejecting === registration.id}
                                  className="cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReject(registration.id);
                                  }}
                                >
                                  {rejecting === registration.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span className="text-sm text-white">Rejecting...</span>
                                    </>
                                  ) : (
                                    <p className="text-sm text-white">Reject</p>
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredRegistrations.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No registrations found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchValue || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No registration requests available at the moment."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Fleet Registration Details Dialog */}
        <Dialog
          open={selectedRegistration !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRegistration(null);
              setIsEditMode(false);
              setEditForm({});
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedRegistration && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {isEditMode ? `Edit Fleet - ${selectedRegistration.companyName || "N/A"}` : `Registration Details - ${selectedRegistration.companyName || "N/A"}`}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode ? "Edit fleet registration information" : "Review the complete registration information"}
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
                              value={editForm.companyName}
                              onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedRegistration.companyName || "N/A"}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 text-muted-foreground">#</span>
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Company Code</span>
                          {isEditMode ? (
                            <Input
                              value={editForm.companyCode}
                              onChange={(e) => setEditForm({ ...editForm, companyCode: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedRegistration.companyCode || "N/A"}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Contact Person</span>
                          {isEditMode ? (
                            <Input
                              value={editForm.contactInfo}
                              onChange={(e) => setEditForm({ ...editForm, contactInfo: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedRegistration.contactInfo}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Phone</span>
                          {isEditMode ? (
                            <Input
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedRegistration.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3 md:col-span-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Address</span>
                          {isEditMode ? (
                            <Input
                              value={editForm.address}
                              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedRegistration.address}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Email</span>
                          {isEditMode ? (
                            <Input
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedRegistration.email || "N/A"}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Plan */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Selected Plan</h3>
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="plan">Subscription Plan</Label>
                          <Select
                            value={editForm.selectedPlan}
                            onValueChange={(value) => setEditForm({ ...editForm, selectedPlan: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="maxVehicles">Max Vehicles</Label>
                          <Input
                            type="number"
                            value={editForm.maxVehicles}
                            onChange={(e) => setEditForm({ ...editForm, maxVehicles: parseInt(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge className={getPlanInfo(selectedRegistration.selectedPlan).color}>
                              {getPlanInfo(selectedRegistration.selectedPlan).name}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {selectedRegistration.maxVehicles === -1
                                ? "Unlimited vehicles"
                                : `Up to ${selectedRegistration.maxVehicles} vehicles`}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold">${selectedRegistration.planPrice || 0}</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission Details */}
                  {!isEditMode && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Submission Details</h3>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Submitted</span>
                          <p className="font-medium">{formatDate(selectedRegistration.submittedAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Information */}
                  {!isEditMode && selectedRegistration.status === "approved" && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-300">Approved</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        Approved on {selectedRegistration.approvedAt ? formatDate(selectedRegistration.approvedAt) : "N/A"} by {selectedRegistration.approvedBy || "Admin"}
                      </p>
                    </div>
                  )}

                  {!isEditMode && selectedRegistration.status === "rejected" && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <X className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-800 dark:text-red-300">Rejected</span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        Rejected on {selectedRegistration.rejectedAt ? formatDate(selectedRegistration.rejectedAt) : "N/A"} by {selectedRegistration.rejectedBy || "Admin"}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {isEditMode ? (
                      <>
                        <Button
                          className="flex-1 cursor-pointer disabled:opacity-50"
                          onClick={handleSaveEdit}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving Changes...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 cursor-pointer"
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>

                        {selectedRegistration.status === "pending" && (
                          <>
                            <Button
                              onClick={() => handleApprove(selectedRegistration.id)}
                              disabled={approving === selectedRegistration.id || rejecting === selectedRegistration.id}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer disabled:opacity-50"
                            >
                              {approving === selectedRegistration.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Approve Registration
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleReject(selectedRegistration.id)}
                              disabled={approving === selectedRegistration.id || rejecting === selectedRegistration.id}
                              variant="destructive"
                              className="flex-1 cursor-pointer disabled:opacity-50"
                            >
                              {rejecting === selectedRegistration.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <X className="w-4 h-4 mr-2" />
                                  Reject Registration
                                </>
                              )}
                            </Button>
                          </>
                        )}
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