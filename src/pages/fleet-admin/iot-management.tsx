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
  Edit,
  Cpu,
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Car,
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/context/userContext";

export default function FleetAdminIOTManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([
    {
      _id: "iot_001",
      objectId: "GPS-TRACKER-001",
      deviceModel: "GPS-Tracker-Pro-X1",
      vehicleId: "vehicle_001",
      vehiclePlate: "ABC-1234",
      driverName: "John Doe",
      companyName: "Tech Transport Co.",
      isActive: true,
      status: "online",
      lastUpdate: "2025-09-22T10:30:00Z",
      signalStrength: 95,
      location: { lat: 14.5995, lng: 120.9842 },
      assignedDate: "2025-09-01T08:00:00Z",
    },
    {
      _id: "iot_002",
      objectId: "GPS-TRACKER-002",
      deviceModel: "GPS-Tracker-Lite-V2",
      vehicleId: "vehicle_002",
      vehiclePlate: "DEF-5678",
      driverName: "Jane Smith",
      companyName: "Tech Transport Co.",
      isActive: false,
      status: "offline",
      lastUpdate: "2025-09-22T08:15:00Z",
      signalStrength: 0,
      location: null,
      assignedDate: "2025-09-05T09:30:00Z",
    },
    {
      _id: "iot_003",
      objectId: "GPS-TRACKER-003",
      deviceModel: "GPS-Tracker-Standard",
      vehicleId: null,
      vehiclePlate: null,
      driverName: null,
      companyName: "Tech Transport Co.",
      isActive: false,
      status: "maintenance",
      lastUpdate: "2025-09-21T16:45:00Z",
      signalStrength: 0,
      location: null,
      assignedDate: "2025-08-20T14:00:00Z",
    },
    {
      _id: "iot_004",
      objectId: "GPS-TRACKER-004",
      deviceModel: "GPS-Tracker-Pro-X1",
      vehicleId: "vehicle_003",
      vehiclePlate: "GHI-9012",
      driverName: "Mike Johnson",
      companyName: "Tech Transport Co.",
      isActive: true,
      status: "online",
      lastUpdate: "2025-09-22T11:00:00Z",
      signalStrength: 88,
      location: { lat: 14.6042, lng: 120.9822 },
      assignedDate: "2025-09-10T07:15:00Z",
    },
    {
      _id: "iot_005",
      objectId: "GPS-TRACKER-005",
      deviceModel: "GPS-Tracker-Lite-V2",
      vehicleId: null,
      vehiclePlate: null,
      driverName: null,
      companyName: "Tech Transport Co.",
      isActive: false,
      status: "offline",
      lastUpdate: "2025-09-20T13:20:00Z",
      signalStrength: 0,
      location: null,
      assignedDate: "2025-08-15T10:00:00Z",
    },
  ]);
  const [vehicles, setVehicles] = useState<any[]>([
    {
      id: "vehicle_001",
      plate: "ABC-1234",
      model: "City Bus Route 1",
      status: "active",
      driverName: "John Doe",
      available_seats: 50,
      location: { lat: 14.5995, lng: 120.9842 },
    },
    {
      id: "vehicle_002",
      plate: "DEF-5678",
      model: "Express Bus Route 2",
      status: "active",
      driverName: "Jane Smith",
      available_seats: 45,
      location: { lat: 14.6042, lng: 120.9822 },
    },
    {
      id: "vehicle_003",
      plate: "GHI-9012",
      model: "Metro Bus Route 3",
      status: "active",
      driverName: "Mike Johnson",
      available_seats: 55,
      location: { lat: 14.5985, lng: 120.9862 },
    },
    {
      id: "vehicle_004",
      plate: "JKL-3456",
      model: "Shuttle Bus Route 4",
      status: "maintenance",
      driverName: "Sarah Wilson",
      available_seats: 30,
      location: null,
    },
    {
      id: "vehicle_005",
      plate: "MNO-7890",
      model: "Premium Bus Route 5",
      status: "active",
      driverName: "David Brown",
      available_seats: 40,
      location: { lat: 14.6012, lng: 120.9832 },
    },
  ]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const { user } = useUser();

  // Using dummy data - no backend calls needed
  useEffect(() => {
    console.log("Fleet Admin IoT Management loaded with dummy data");
  }, []);



  const handleEditDevice = (device: any) => {
    setSelectedDevice(device);
    // Find the vehicle ID based on vehicle plate
    const vehicle = vehicles.find(v => v.plate === device.vehiclePlate);
    setEditForm({
      objectId: device.objectId,
      deviceModel: device.deviceModel,
      status: device.status,
      vehicleId: vehicle?.id || "unassigned",
      vehiclePlate: device.vehiclePlate || "",
      driverName: device.driverName || "",
    });
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      // Find the selected vehicle object
      const selectedVehicle = editForm.vehicleId === "unassigned" ? null : vehicles.find(v => v.id === editForm.vehicleId);
      const newVehiclePlate = selectedVehicle ? selectedVehicle.plate : "";
      const newDriverName = selectedVehicle ? selectedVehicle.driverName : "";

      // Simulate API call with dummy data update
      console.log("Updating device (dummy data):", {
        device_name: editForm.objectId,
        device_model: editForm.deviceModel,
        vehicle_id: editForm.vehicleId === "unassigned" ? null : editForm.vehicleId,
        status: editForm.status,
      });

      // Update the device in local state
      setDevices(prev => 
        prev.map(device => 
          device._id === selectedDevice._id 
            ? { 
                ...device, 
                objectId: editForm.objectId,
                deviceModel: editForm.deviceModel,
                status: editForm.status,
                vehicleId: editForm.vehicleId === "unassigned" ? null : editForm.vehicleId,
                vehiclePlate: newVehiclePlate,
                driverName: newDriverName,
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
        vehicleId: editForm.vehicleId === "unassigned" ? null : editForm.vehicleId,
        vehiclePlate: newVehiclePlate,
        driverName: newDriverName,
      });
      
      setIsEditMode(false);
      alert("Device updated successfully! (Dummy data)");
    } catch (err: any) {
      alert(`Error updating device: ${err.message}`);
      console.error(err);
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
      (device.driverName &&
        device.driverName.toLowerCase().includes(searchValue.toLowerCase())) ||
      device.deviceModel.toLowerCase().includes(searchValue.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "assigned" && device.vehicleId !== null) ||
      (filterStatus === "unassigned" && device.vehicleId === null) ||
      (filterStatus === "online" && device.status === "online") ||
      (filterStatus === "offline" && device.status === "offline") ||
      (filterStatus === "maintenance" && device.status === "maintenance");

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
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">IoT Device Management</h1>
            <p className="text-muted-foreground">Manage and assign IoT devices to your fleet vehicles</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                  <p className="text-2xl font-bold text-foreground">
                    {devices.filter(d => d.vehicleId !== null).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                  <p className="text-2xl font-bold text-foreground">
                    {devices.filter(d => d.vehicleId === null).length}
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
              placeholder="Search devices by ID, vehicle plate, or driver..."
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
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* IOT Devices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              IoT Devices ({filteredDevices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Device Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Model</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vehicle Assignment</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Driver</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Update</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => (
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
                        {device.vehicleId ? (
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{device.vehiclePlate}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Unassigned
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {device.driverName ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{device.driverName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDevice(device);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDevices.length === 0 && (
              <div className="text-center py-8">
                <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No devices found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchValue || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No IoT devices assigned to your company at the moment."}
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
                    {isEditMode ? "Edit device information and vehicle assignment" : "Complete information about this IoT device"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Device Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Device Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Cpu className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-sm font-medium text-muted-foreground">Device Name</Label>
                        </div>
                        {isEditMode ? (
                          <Input
                            value={editForm.objectId}
                            onChange={(e) => setEditForm({...editForm, objectId: e.target.value})}
                            className="w-full"
                          />
                        ) : (
                          <p className="font-medium text-foreground">{selectedDevice.objectId}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-sm font-medium text-muted-foreground">Model</Label>
                        </div>
                        {isEditMode ? (
                          <Input
                            value={editForm.deviceModel}
                            onChange={(e) => setEditForm({...editForm, deviceModel: e.target.value})}
                            className="w-full"
                          />
                        ) : (
                          <p className="font-medium text-foreground">{selectedDevice.deviceModel}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Assignment Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Vehicle Assignment</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-sm font-medium text-muted-foreground">Vehicle Assignment</Label>
                        </div>
                        {isEditMode ? (
                          <div className="space-y-3">
                            <Select
                              value={editForm.vehicleId || "unassigned"}
                              onValueChange={(value) => {
                                if (value === "unassigned") {
                                  setEditForm({
                                    ...editForm, 
                                    vehicleId: "",
                                    vehiclePlate: "",
                                    driverName: ""
                                  });
                                } else {
                                  const selectedVehicle = vehicles.find(v => v.id === value);
                                  setEditForm({
                                    ...editForm, 
                                    vehicleId: value,
                                    vehiclePlate: selectedVehicle ? selectedVehicle.plate : "",
                                    driverName: selectedVehicle ? selectedVehicle.driverName : ""
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select vehicle or leave unassigned" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {vehicles.map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    {vehicle.plate} - {vehicle.model}
                                    {vehicle.driverName && ` (${vehicle.driverName})`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {editForm.vehicleId && editForm.vehicleId !== "unassigned" && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                  <div className="font-medium">Device will be assigned to:</div>
                                  <div className="mt-1">{vehicles.find(v => v.id === editForm.vehicleId)?.plate}</div>
                                </div>
                              </div>
                            )}
                            {editForm.vehicleId === "unassigned" && (
                              <div className="p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                  Device will be unassigned from any vehicle
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="font-medium text-foreground">{selectedDevice.vehiclePlate || "Unassigned"}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <Label className="text-sm font-medium text-muted-foreground">Driver</Label>
                          </div>
                          <p className="font-medium text-foreground">{selectedDevice.driverName || "No driver assigned"}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <Label className="text-sm font-medium text-muted-foreground">Assigned Date</Label>
                          </div>
                          <p className="font-medium text-foreground">{formatDate(selectedDevice.assignedDate!)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Status Information</h3>
                    <div className="space-y-4">
                      {isEditMode ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <Activity className="w-4 h-4" />
                              Device Status
                            </Label>
                            <Select
                              value={editForm.status}
                              onValueChange={(value) => setEditForm({...editForm, status: value})}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="offline">Offline</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Current Status
                          </Label>
                          <div className="flex items-center gap-3">
                            {getStatusIcon(selectedDevice.status)}
                            <Badge className={getStatusColor(selectedDevice.status)}>
                              {selectedDevice.status.charAt(0).toUpperCase() + selectedDevice.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-sm font-medium text-muted-foreground">Last Update</Label>
                        </div>
                        <p className="font-medium text-foreground">{formatDate(selectedDevice.lastUpdate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t border-border mt-6">
                    {isEditMode ? (
                      <>
                        <Button 
                          className="flex-1 h-11"
                          onClick={handleSaveEdit}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 h-11"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          className="flex-1 h-11"
                          onClick={() => {
                            // Find the vehicle ID based on vehicle plate
                            const vehicle = vehicles.find(v => v.plate === selectedDevice.vehiclePlate);
                            setEditForm({
                              objectId: selectedDevice.objectId,
                              deviceModel: selectedDevice.deviceModel,
                              status: selectedDevice.status,
                              vehicleId: vehicle?.id || "unassigned",
                              vehiclePlate: selectedDevice.vehiclePlate || "",
                              driverName: selectedDevice.driverName || "",
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