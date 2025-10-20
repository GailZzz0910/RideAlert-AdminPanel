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
  Cpu,
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Loader2
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
import AddIOTDeviceDialog from "@/components/add-iot-device-dialog";
import { useUser } from "@/context/userContext";
import { wsBaseURL } from "@/utils/api";
import { apiBaseURL } from "@/utils/api";

// Skeleton component for loading states
const TableSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="border-b border-border">
        <div className="py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-5 h-5 bg-muted rounded"></div>
            <div>
              <div className="h-4 bg-muted rounded w-32 mb-2"></div>
              <div className="h-3 bg-muted/60 rounded w-48"></div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-4 bg-muted rounded w-12"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
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

export default function SuperAdminIOTManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [companies, setCompanies] = useState<any[]>([]);

  const { token } = useUser();

  // Fetch IoT devices from backend
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3 seconds

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(`${wsBaseURL}/iot_devices/ws/all`);

        ws.onopen = () => {
          console.log("Connected to IoT WebSocket");
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.devices) {
              setLoading(false); // Data received, stop loading
              const mapped = data.devices.map((d: any) => ({
                _id: typeof d._id === "string" ? d._id : d._id.$oid || String(d._id),
                objectId: d.device_name,
                deviceModel: d.device_model || "Unknown",
                vehicleId: d.vehicle_id !== "None" ? d.vehicle_id : null,
                vehiclePlate: d.vehicle_id !== "None" ? d.vehicle_id : null,
                companyName: d.company_name || null,
                isActive: d.is_active === "active",
                status:
                  d.is_active === "active"
                    ? "online"
                    : d.is_active === "maintenance"
                      ? "maintenance"
                      : "offline",
                lastUpdate: d.last_update || d.createdAt,
                signalStrength: d.is_active === "active" ? 90 : 0,
                location: null,
                assignedDate: d.createdAt,
              }));

              setDevices(mapped);

              // If a device is currently selected in the details dialog, update it from the latest payload
              if (selectedDevice) {
                const updated = mapped.find((m: any) => m._id === selectedDevice._id || m.objectId === selectedDevice.objectId);
                if (updated) {
                  // Update selectedDevice so UI reflects real-time status change
                  setSelectedDevice(prev => ({ ...(prev || {}), ...updated }));

                  // If not editing, also sync the editForm so the dialog shows up-to-date values
                  if (!isEditMode) {
                    setEditForm(prev => ({ ...(prev || {}),
                      objectId: updated.objectId,
                      deviceModel: updated.deviceModel,
                      status: updated.status,
                      companyName: updated.companyName,
                    }));
                  }
                }
              }
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket connection error. Check if backend is running on localhost:8000");
          console.error("Error details:", err);
        };

        ws.onclose = (event) => {
          console.log(`WebSocket closed: Code ${event.code}, Reason: ${event.reason || 'No reason'}`);

          // Only attempt reconnection if it wasn't a manual close
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${reconnectDelay / 1000}s...`);

            reconnectTimeout = setTimeout(() => {
              connectWebSocket();
            }, reconnectDelay);
          } else if (reconnectAttempts >= maxReconnectAttempts) {
            console.error("Max reconnection attempts reached. Please check your backend server and refresh the page.");
          }
        };

      } catch (err) {
        console.error("Failed to create WebSocket connection:", err);
      }
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, []);

  // Fetch companies for business assignment
  useEffect(() => {
    let companiesWs: WebSocket | null = null;

    const fetchCompanies = () => {
      try {
        companiesWs = new WebSocket(`${wsBaseURL}/fleets/ws/all?token=${token}`);

        companiesWs.onopen = () => {
          console.log("Companies WebSocket connected for IoT management");
        };

        companiesWs.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.fleets && Array.isArray(data.fleets)) {
              const mappedCompanies = data.fleets.map((fleet: any) => ({
                id: fleet.id,
                name: fleet.company_name,
              }));
              setCompanies(mappedCompanies);
            } else {
              console.error("Unexpected companies WebSocket data format:", data);
              setCompanies([]);
            }
          } catch (err) {
            console.error("Error parsing companies WebSocket data:", err);
            setCompanies([]);
          }
        };

        companiesWs.onerror = (err) => {
          console.error("Companies WebSocket error:", err);
          setCompanies([]);
        };

        companiesWs.onclose = () => {
          console.log("Companies WebSocket closed");
        };
      } catch (err) {
        console.error("Failed to create companies WebSocket connection:", err);
        setCompanies([]);
      }
    };

    if (token) {
      fetchCompanies();
    }

    return () => {
      if (companiesWs) {
        companiesWs.close();
      }
    };
  }, [token]);

  const handleDeleteDevice = async (deviceId: string) => {
    if (!deviceId) return alert("Device ID is missing!");
    if (deleting) return; // Prevent multiple deletions

    try {
      setDeleting(deviceId);
      
      const response = await fetch(`${apiBaseURL}/iot_devices/${deviceId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete device");
      }

      // Remove deleted device from state
      setDevices(prev => prev.filter(d => d._id !== deviceId));
      alert("Device deleted successfully");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleAddDevice = (newDevice: any) => {
    // Don't manually update state - let WebSocket handle it
    console.log("Device added successfully:", newDevice);
    // The WebSocket will automatically receive the updated devices list
    // and update the state accordingly
  };

  const handleEditDevice = (device: any) => {
    setSelectedDevice(device);
    // Find the company based on company name
    const company = companies.find(c => c.name === device.companyName);
    setEditForm({
      objectId: device.objectId,
      deviceModel: device.deviceModel,
      status: device.status,
      companyId: company?.id || "unassigned",
      companyName: device.companyName || "",
    });
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (updating) return; // Prevent multiple updates
    
    try {
      setUpdating(true);
      
      // Find the selected company object
      const selectedCompany = editForm.companyId === "unassigned" ? null : companies.find(c => c.id === editForm.companyId);
      const newCompanyName = selectedCompany ? selectedCompany.name : "";
      
      // Call backend API to update device
      const updatePayload = {
        device_name: editForm.objectId,
        device_model: editForm.deviceModel,
        is_active: editForm.status === "online" ? "active" : editForm.status === "maintenance" ? "maintenance" : "inactive",
        company_name: newCompanyName || null,
      };

      const response = await fetch(`${apiBaseURL}/iot_devices/${selectedDevice._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to update device");
      }

      // Update the device in local state
      setDevices(prev => 
        prev.map(device => 
          device._id === selectedDevice._id 
            ? { 
                ...device, 
                objectId: editForm.objectId,
                deviceModel: editForm.deviceModel,
                status: editForm.status,
                companyName: newCompanyName,
              }
            : device
        )
      );
      
      // Update selectedDevice to reflect changes
      setSelectedDevice({
        ...selectedDevice,
        objectId: editForm.objectId,
        deviceModel: editForm.deviceModel,
        status: editForm.status,
        companyName: newCompanyName,
      });
      
      setIsEditMode(false);
      alert("Device updated successfully!");
    } catch (err: any) {
      alert(`Error updating device: ${err.message}`);
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm({});
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.objectId.toLowerCase().includes(searchValue.toLowerCase()) ||
      (device.vehiclePlate &&
        device.vehiclePlate.toLowerCase().includes(searchValue.toLowerCase())) ||
      (device.companyName &&
        device.companyName.toLowerCase().includes(searchValue.toLowerCase())) ||
      device.deviceModel.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "online" && device.status === "online") ||
      (filterStatus === "offline" && device.status === "offline");

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "offline":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "unassigned":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="w-4 h-4" />;
      case "offline":
        return <WifiOff className="w-4 h-4" />;
      case "maintenance":
        return <AlertCircle className="w-4 h-4" />;
      case "unassigned":
        return <Clock className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
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

        <h1 className="text-3xl font-bold text-foreground">IoT Device Management</h1>
            <p className="text-muted-foreground">Create IoT Devices and assign them to a fleet company.</p>

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
                      <Cpu className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Devices</p>
                      <p className="text-2xl font-bold text-foreground">{devices.length}</p>
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
                      <p className="text-sm text-muted-foreground">Online</p>
                      <p className="text-2xl font-bold text-foreground">
                        {devices.filter(d => d.status === "online").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <WifiOff className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Offline</p>
                      <p className="text-2xl font-bold text-foreground">
                        {devices.filter(d => d.status === "offline").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company Assigned</p>
                      <p className="text-2xl font-bold text-foreground">
                        {devices.filter(d => d.companyName !== null).length}
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
              placeholder="Search devices by ID, vehicle plate, or company..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 ">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="online">Active</option>
              <option value="offline">Inactive</option>
            </select>
          </div>

          {/* Add Device Button */}
          <AddIOTDeviceDialog onAddDevice={handleAddDevice}>
            <Button className="cursor-pointer" disabled={loading || updating}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Device
            </Button>
          </AddIOTDeviceDialog>
        </div>

        {/* IOT Devices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              IOT Devices {!loading && `(${filteredDevices.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Device Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Model</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company Assignment</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Update</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <TableSkeleton />
                      </td>
                    </tr>
                  ) : (
                    filteredDevices.map((device) => (
                    <tr 
                      key={device._id} 
                      className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedDevice(device)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{device.objectId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-foreground">{device.deviceModel}</span>
                      </td>
                      <td className="py-4 px-4">
                        {device.companyName ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{device.companyName}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Unassigned
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(device.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(device.status)}
                            {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                          </div>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-foreground">{formatDate(device.lastUpdate)}</span>
                          <span className="text-xs text-muted-foreground">{formatTimeSince(device.lastUpdate)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="cursor-pointer"
                            disabled={updating || deleting === device._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDevice(device);
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
                                disabled={updating || deleting === device._id}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click when opening delete dialog
                                }}
                              >
                                {deleting === device._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Device</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete device "{device.objectId}"? 
                                  This action cannot be undone and will permanently remove the device from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleting === device._id}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleting === device._id}
                                  onClick={() => handleDeleteDevice(device._id)}
                                >
                                  {deleting === device._id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    'Delete Device'
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

            {!loading && filteredDevices.length === 0 && (
              <div className="text-center py-8">
                <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No devices found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchValue || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No IOT devices available at the moment."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Details Dialog */}
        <Dialog 
          open={selectedDevice !== null} 
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDevice(null);
              setIsEditMode(false);
              setEditForm({});
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedDevice && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    {isEditMode ? `Edit Device - ${selectedDevice.objectId}` : `Device Details - ${selectedDevice.objectId}`}
                  </DialogTitle>
                  <DialogDescription>
                    {isEditMode ? "Edit device information and company assignment" : "Complete information about this IOT device"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Device Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Device Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Device Name</span>
                          {isEditMode ? (
                            <Input
                              value={editForm.objectId}
                              onChange={(e) => setEditForm({...editForm, objectId: e.target.value})}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedDevice.objectId}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Model</span>
                          {isEditMode ? (
                            <Input
                              value={editForm.deviceModel}
                              onChange={(e) => setEditForm({...editForm, deviceModel: e.target.value})}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium">{selectedDevice.deviceModel}</p>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  </div>

                  {/* Company Assignment Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Company Assignment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Assigned Company</span>
                          {isEditMode ? (
                            <div className="mt-1">
                              <Select
                                value={editForm.companyId || "unassigned"}
                                onValueChange={(value) => {
                                  if (value === "unassigned") {
                                    setEditForm({
                                      ...editForm, 
                                      companyId: "",
                                      companyName: ""
                                    });
                                  } else {
                                    const selectedCompany = companies.find(c => c.id === value);
                                    setEditForm({
                                      ...editForm, 
                                      companyId: value,
                                      companyName: selectedCompany ? selectedCompany.name : ""
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select company or leave unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">Unassigned</SelectItem>
                                  {companies.map((company) => (
                                    <SelectItem key={company.id} value={company.id}>
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {editForm.companyId && editForm.companyId !== "unassigned" && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Device will be assigned to: {companies.find(c => c.id === editForm.companyId)?.name}
                                </p>
                              )}
                              {editForm.companyId === "unassigned" && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Device will be unassigned from any company
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="font-medium">{selectedDevice.companyName || "Unassigned"}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm text-muted-foreground">Assigned Date</span>
                          <p className="font-medium">{formatDate(selectedDevice.assignedDate!)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Status Information</h3>
                    {isEditMode ? (
                      <div className="space-y-3">
                      
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mb-4">
                        {getStatusIcon(selectedDevice.status)}
                        <Badge className={getStatusColor(selectedDevice.status)}>
                          {selectedDevice.status.charAt(0).toUpperCase() + selectedDevice.status.slice(1)}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-4">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">Last Update</span>
                        <p className="font-medium">{formatDate(selectedDevice.lastUpdate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {isEditMode ? (
                      <>
                        <Button 
                          className="flex-1 cursor-pointer"
                          disabled={updating}
                          onClick={handleSaveEdit}
                        >
                          {updating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 cursor-pointer"
                          disabled={updating}
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
                            // Find the company based on company name
                            const company = companies.find(c => c.name === selectedDevice.companyName);
                            setEditForm({
                              objectId: selectedDevice.objectId,
                              deviceModel: selectedDevice.deviceModel,
                              status: selectedDevice.status,
                              companyId: company?.id || "unassigned",
                              companyName: selectedDevice.companyName || "",
                            });
                            setIsEditMode(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Device
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