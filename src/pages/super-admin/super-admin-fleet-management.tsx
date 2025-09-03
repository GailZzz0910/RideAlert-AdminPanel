import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data for pending registrations - replace with real API calls later
const mockPendingRegistrations = [
  {
    id: 1,
    companyName: "Swift Logistics Ltd.",
    companyCode: "SWL2024",
    contactInfo: "Sarah Johnson",
    email: "sarah.johnson@swiftlogistics.com",
    phone: "+1 (555) 234-5678",
    address: "1234 Business Ave, New York, NY 10001",
    selectedPlan: "premium",
    planPrice: 79,
    maxVehicles: 50,
    submittedAt: "2024-09-01T14:30:00Z",
    status: "pending",
    documents: ["business_license.pdf", "insurance_certificate.pdf"]
  },
  {
    id: 2,
    companyName: "Metro Transport Solutions",
    companyCode: "MTS2024",
    contactInfo: "Michael Chen",
    email: "m.chen@metrotransport.com",
    phone: "+1 (555) 345-6789",
    address: "5678 Industrial Rd, Los Angeles, CA 90210",
    selectedPlan: "enterprise",
    planPrice: 199,
    maxVehicles: -1,
    submittedAt: "2024-09-01T09:15:00Z",
    status: "pending",
    documents: ["business_license.pdf", "fleet_inventory.xlsx"]
  },
  {
    id: 3,
    companyName: "City Bus Corporation",
    companyCode: "CBC2024",
    contactInfo: "Jennifer Williams",
    email: "j.williams@citybus.com",
    phone: "+1 (555) 456-7890",
    address: "9012 Transit Center, Chicago, IL 60601",
    selectedPlan: "basic",
    planPrice: 29,
    maxVehicles: 5,
    submittedAt: "2024-08-31T16:45:00Z",
    status: "pending",
    documents: ["business_license.pdf"]
  },
  {
    id: 4,
    companyName: "Express Fleet Services",
    companyCode: "EFS2024",
    contactInfo: "Robert Davis",
    email: "robert@expressfleet.com",
    phone: "+1 (555) 567-8901",
    address: "3456 Commerce St, Houston, TX 77001",
    selectedPlan: "premium",
    planPrice: 79,
    maxVehicles: 50,
    submittedAt: "2024-08-31T11:20:00Z",
    status: "approved",
    approvedAt: "2024-09-01T10:00:00Z",
    approvedBy: "Admin"
  },
  {
    id: 5,
    companyName: "Quick Transit Co.",
    companyCode: "QTC2024",
    contactInfo: "Lisa Anderson",
    email: "lisa@quicktransit.com",
    phone: "+1 (555) 678-9012",
    address: "7890 Delivery Lane, Phoenix, AZ 85001",
    selectedPlan: "basic",
    planPrice: 29,
    maxVehicles: 5,
    submittedAt: "2024-08-30T13:30:00Z",
    status: "rejected",
    rejectedAt: "2024-09-01T08:30:00Z",
    rejectedBy: "Admin",
    rejectionReason: "Incomplete documentation"
  }
];

const plans = {
  basic: { name: "Basic", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  premium: { name: "Premium", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  enterprise: { name: "Enterprise", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" }
};

export default function SuperAdminFleetManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);

  const filteredRegistrations = mockPendingRegistrations.filter((registration) => {
    const matchesSearch = 
      registration.companyName.toLowerCase().includes(searchValue.toLowerCase()) ||
      registration.contactInfo.toLowerCase().includes(searchValue.toLowerCase()) ||
      registration.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      registration.companyCode.toLowerCase().includes(searchValue.toLowerCase());
    
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

  const handleApprove = (id: number) => {
    // TODO: Implement approval logic
    console.log("Approving registration:", id);
  };

  const handleReject = (id: number) => {
    // TODO: Implement rejection logic
    console.log("Rejecting registration:", id);
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

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockPendingRegistrations.filter(r => r.status === "pending").length}
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
                    {mockPendingRegistrations.filter(r => r.status === "approved").length}
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
                    {mockPendingRegistrations.filter(r => r.status === "rejected").length}
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
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockPendingRegistrations.length}
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
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((registration) => (
                    <tr key={registration.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{registration.companyName}</span>
                          <span className="text-sm text-muted-foreground">{registration.companyCode}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{registration.contactInfo}</span>
                          <span className="text-xs text-muted-foreground">{registration.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <Badge className={plans[registration.selectedPlan as keyof typeof plans].color}>
                            {plans[registration.selectedPlan as keyof typeof plans].name}
                          </Badge>
                          <span className="text-xs text-muted-foreground mt-1">
                            ${registration.planPrice}/month
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(registration.status)}>
                          {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{formatDate(registration.submittedAt)}</span>
                          <span className="text-xs text-muted-foreground">{formatTimeSince(registration.submittedAt)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => setSelectedRegistration(registration)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Building className="w-5 h-5" />
                                  Registration Details - {registration.companyName}
                                </DialogTitle>
                                <DialogDescription>
                                  Review the complete registration information
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                {/* Company Information */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Company Information</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                      <Building className="w-4 h-4 text-muted-foreground" />
                                      <div>
                                        <span className="text-sm text-muted-foreground">Company Name</span>
                                        <p className="font-medium">{registration.companyName}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="w-4 h-4 text-muted-foreground">#</span>
                                      <div>
                                        <span className="text-sm text-muted-foreground">Company Code</span>
                                        <p className="font-medium">{registration.companyCode}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      <div>
                                        <span className="text-sm text-muted-foreground">Contact Person</span>
                                        <p className="font-medium">{registration.contactInfo}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <div>
                                        <span className="text-sm text-muted-foreground">Phone</span>
                                        <p className="font-medium">{registration.phone}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3 md:col-span-2">
                                      <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                      <div>
                                        <span className="text-sm text-muted-foreground">Address</span>
                                        <p className="font-medium">{registration.address}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <div>
                                        <span className="text-sm text-muted-foreground">Email</span>
                                        <p className="font-medium">{registration.email}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Subscription Plan */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Selected Plan</h3>
                                  <div className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <Badge className={plans[registration.selectedPlan as keyof typeof plans].color}>
                                          {plans[registration.selectedPlan as keyof typeof plans].name}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {registration.maxVehicles === -1 
                                            ? "Unlimited vehicles" 
                                            : `Up to ${registration.maxVehicles} vehicles`}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-2xl font-bold">${registration.planPrice}</span>
                                        <span className="text-muted-foreground">/month</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Submission Details */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">Submission Details</h3>
                                  <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                      <span className="text-sm text-muted-foreground">Submitted</span>
                                      <p className="font-medium">{formatDate(registration.submittedAt)}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Status Information */}
                                {registration.status === "approved" && (
                                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                      <Check className="w-5 h-5 text-green-600" />
                                      <span className="font-medium text-green-800 dark:text-green-300">Approved</span>
                                    </div>
                                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                      Approved on {formatDate(registration.approvedAt!)} by {registration.approvedBy}
                                    </p>
                                  </div>
                                )}

                                {registration.status === "rejected" && (
                                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                      <X className="w-5 h-5 text-red-600" />
                                      <span className="font-medium text-red-800 dark:text-red-300">Rejected</span>
                                    </div>
                                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                      Rejected on {formatDate(registration.rejectedAt!)} by {registration.rejectedBy}
                                    </p>
                                    {registration.rejectionReason && (
                                      <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                                        <strong>Reason:</strong> {registration.rejectionReason}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Actions for pending registrations */}
                                {registration.status === "pending" && (
                                  <div className="flex gap-3 pt-4 border-t">
                                    <Button 
                                      onClick={() => handleApprove(registration.id)}
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Approve Registration
                                    </Button>
                                    <Button 
                                      onClick={() => handleReject(registration.id)}
                                      variant="destructive"
                                      className="flex-1 cursor-pointer"
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      Reject Registration
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {registration.status === "pending" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleApprove(registration.id)}
                                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="cursor-pointer"
                                onClick={() => handleReject(registration.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
      </div>
    </ScrollArea>
  );
}
