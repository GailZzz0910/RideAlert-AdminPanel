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
import { wsBaseURL, apiBaseURL } from "@/utils/api";

export default function FleetAdminIOTManagement() {
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const { user, token } = useUser();

  // Helper function to map vehicle information to devices
  const mapDevicesWithVehicleInfo = (deviceList: any[], vehicleList: any[]) => {
    return deviceList.map(device => {
      if (device.vehicleId && device.vehicleId !== "None" && device.vehicleId !== null) {
        const vehicle = vehicleList.find(v => v.id === device.vehicleId);
        if (vehicle) {
          return {
            ...device,
            vehiclePlate: vehicle.plate,
            driverName: vehicle.driverName,
          };
        }
      }
      return {
        ...device,
        vehiclePlate: null,
        driverName: null,
      };
    });
  };

  // Fetch vehicles for this fleet
  useEffect(() => {
    let vehiclesWs: WebSocket | null = null;

    const fetchVehicles = () => {
      try {
        const fleetId = user?.id || user?.fleet_id;
        if (!fleetId) {
          console.error("No fleet ID found for user");
          return;
        }

        vehiclesWs = new WebSocket(`${wsBaseURL}/vehicles/ws/vehicles/all/${fleetId}?token=${token}`);

        vehiclesWs.onopen = () => {
          console.log("Vehicles WebSocket connected for IoT management");
        };

        vehiclesWs.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.vehicles && Array.isArray(data.vehicles)) {
              const mappedVehicles = data.vehicles.map((vehicle: any) => ({
                id: vehicle.id,
                plate: vehicle.plate,
                model: `${vehicle.vehicle_type} - ${vehicle.route}`,
                status: vehicle.status,
                driverName: vehicle.driverName,
                available_seats: vehicle.available_seats,
                location: vehicle.location,
                device_id: vehicle.device_id,
              }));
              setVehicles(mappedVehicles);

              // Update devices with vehicle information whenever vehicles change
              setDevices(prevDevices => mapDevicesWithVehicleInfo(prevDevices, mappedVehicles));
            } else {
              console.error("Unexpected vehicles WebSocket data format:", data);
              setVehicles([]);
            }
          } catch (err) {
            console.error("Error parsing vehicles WebSocket data:", err);
            setVehicles([]);
          }
        };

        vehiclesWs.onerror = (err) => {
          console.error("Vehicles WebSocket error:", err);
          setVehicles([]);
        };

        vehiclesWs.onclose = () => {
          console.log("Vehicles WebSocket closed");
        };
      } catch (err) {
        console.error("Failed to create vehicles WebSocket connection:", err);
        setVehicles([]);
      }
    };

    if (user && token) {
      fetchVehicles();
    }

    return () => {
      if (vehiclesWs) {
        vehiclesWs.close();
      }
    };
  }, [user, token]);

  // Fetch IoT devices assigned to this company from backend
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
              // Filter devices that are assigned to the current fleet's company
              const fleetCompanyName = user?.company_name || user?.fleet?.company_name;
              const filteredDevices = data.devices.filter((d: any) => {
                return d.company_name === fleetCompanyName;
              });

              const mapped = filteredDevices.map((d: any) => ({
                _id: typeof d._id === "string" ? d._id : d._id.$oid || String(d._id),
                objectId: d.device_name,
                deviceModel: d.device_model || "Unknown",
                vehicleId: d.vehicle_id !== "None" && d.vehicle_id !== null ? d.vehicle_id : null,
                vehiclePlate: null, // Will be populated by mapDevicesWithVehicleInfo
                driverName: null, // Will be populated by mapDevicesWithVehicleInfo
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
                notes: d.notes || "",
              }));

              // Map vehicle information to devices
              const devicesWithVehicleInfo = mapDevicesWithVehicleInfo(mapped, vehicles);
              setDevices(devicesWithVehicleInfo);
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
    if (user && token) {
      connectWebSocket();
    }

    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, [user, token, vehicles]); // Added vehicles as dependency

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
      notes: device.notes || "",
    });
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedDevice?._id) {
      alert("No device selected for editing");
      return;
    }

    try {
      // Find the selected vehicle object
      const selectedVehicle = editForm.vehicleId === "unassigned" ? null : vehicles.find(v => v.id === editForm.vehicleId);
      const newVehiclePlate = selectedVehicle ? selectedVehicle.plate : null;
      const newDriverName = selectedVehicle ? selectedVehicle.driverName : null;

      // Prepare update payload for IoT device
      const vehicleIdForIoT = editForm.vehicleId === "unassigned" ? null : editForm.vehicleId;
      const updatePayload = {
        device_name: editForm.objectId,
        device_model: editForm.deviceModel,
        vehicle_id: vehicleIdForIoT,
        is_active: editForm.status === "online" ? "active" : editForm.status === "maintenance" ? "maintenance" : "inactive",
        notes: editForm.notes,
      };

      console.log("=== DEBUG: Starting device update ===");
      console.log("Device ID:", selectedDevice._id);
      console.log("Vehicle ID for IoT:", vehicleIdForIoT);
      console.log("Update payload:", updatePayload);

      // Make API call to update device
      const response = await fetch(`${apiBaseURL}/iot_devices/${selectedDevice._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload),
      });

      console.log("IoT device update response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("IoT device update error:", errorData);
        throw new Error(errorData.detail || "Failed to update device");
      }

      const updatedDevice = await response.json();
      console.log("IoT device update successful:", updatedDevice);

      // Update vehicle's device_id using the correct endpoint
      if (editForm.vehicleId && editForm.vehicleId !== "unassigned") {
        console.log("=== DEBUG: Starting vehicle device assignment ===");
        console.log("Vehicle ID:", editForm.vehicleId);
        console.log("Device ID to assign:", selectedDevice._id);

        // First, remove device_id from any vehicle that currently has this device assigned
        const currentVehicleWithThisDevice = vehicles.find(v => v.device_id === selectedDevice._id);
        if (currentVehicleWithThisDevice && currentVehicleWithThisDevice.id !== editForm.vehicleId) {
          console.log(`Removing device from current vehicle: ${currentVehicleWithThisDevice.id}`);
          const removeResponse = await fetch(`${apiBaseURL}/vehicles/assign-device/${currentVehicleWithThisDevice.id}?device_id=`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`
            },
          });
          console.log("Remove device response status:", removeResponse.status);
        }

        // Then assign the device to the new vehicle
        console.log(`Assigning device to new vehicle: ${editForm.vehicleId}`);
        const assignResponse = await fetch(`${apiBaseURL}/vehicles/assign-device/${editForm.vehicleId}?device_id=${selectedDevice._id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          },
        });

        console.log("Assign device response status:", assignResponse.status);

        if (!assignResponse.ok) {
          const errorData = await assignResponse.json();
          console.error("Vehicle device assignment failed:", errorData);
          throw new Error(`Vehicle assignment failed: ${errorData.detail || 'Unknown error'}`);
        } else {
          console.log("Vehicle device assignment successful");
          const assignResult = await assignResponse.json();
          console.log("Assignment result:", assignResult);
        }
      } else {
        // If unassigning, remove device_id from any vehicle that has this device
        const currentVehicleWithThisDevice = vehicles.find(v => v.device_id === selectedDevice._id);
        if (currentVehicleWithThisDevice) {
          console.log(`Unassigning device from vehicle: ${currentVehicleWithThisDevice.id}`);
          const unassignResponse = await fetch(`${apiBaseURL}/vehicles/assign-device/${currentVehicleWithThisDevice.id}?device_id=`, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`
            },
          });
          console.log("Unassign response status:", unassignResponse.status);
        }
      }

      // Update selectedDevice immediately to reflect changes in the dialog
      const updatedSelectedDevice = {
        ...selectedDevice,
        objectId: editForm.objectId,
        deviceModel: editForm.deviceModel,
        status: editForm.status,
        vehicleId: editForm.vehicleId === "unassigned" ? null : editForm.vehicleId,
        vehiclePlate: newVehiclePlate,
        driverName: newDriverName,
        notes: editForm.notes,
      };

      setSelectedDevice(updatedSelectedDevice);

      // Update local state
      setDevices(prev =>
        prev.map(device =>
          device._id === selectedDevice._id
            ? updatedSelectedDevice
            : device
        )
      );

      setIsEditMode(false);
      alert("Device updated successfully!");
    } catch (err: any) {
      console.error("=== DEBUG: Overall error ===");
      console.error(err);
      alert(`Error updating device: ${err.message}`);
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
                            onChange={(e) => setEditForm({ ...editForm, objectId: e.target.value })}
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
                            onChange={(e) => setEditForm({ ...editForm, deviceModel: e.target.value })}
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
                              onValueChange={(value) => setEditForm({ ...editForm, status: value })}
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

                      {/* Notes section */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                        {isEditMode ? (
                          <Input
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            placeholder="Add notes about this device..."
                            className="w-full"
                          />
                        ) : (
                          <p className="font-medium text-foreground">{selectedDevice.notes || "No notes"}</p>
                        )}
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
                              notes: selectedDevice.notes || "",
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