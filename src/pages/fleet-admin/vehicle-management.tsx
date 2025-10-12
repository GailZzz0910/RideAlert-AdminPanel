
import { ScrollArea } from "@/components/ui/scroll-area";
import { VehicleListView } from "@/components/vehicle-list-view";
import type { VehicleListItem } from "@/components/vehicle-list-view";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { useVehicleWebSocket } from "@/components/useVehicleWebsocket";
import { Search, ListFilter, ChevronDown, Plus, MapPin, Route, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useUser } from "@/context/userContext";
import { wsBaseURL, apiBaseURL } from "@/utils/api";

interface Route {
  id: string;
  startLocation: string;
  endLocation: string;
  landmarkStart: string;
  landmarkEnd: string;
}

export default function VehicleManagement() {
  const { user } = useUser();  // 👈 get logged in fleet
  const fleetId = user?.id;    // or user?.fleet_id depending on backend
  const liveVehicles = useVehicleWebSocket(
    fleetId ? `${wsBaseURL}/ws/vehicles/all/${fleetId}` : null
  );
  const [searchValue, setSearchValue] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("Any");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<VehicleListItem | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Route management states
  const [isAddRouteDialogOpen, setIsAddRouteDialogOpen] = useState(false);
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [newRoute, setNewRoute] = useState<Omit<Route, 'id'>>({
    startLocation: "",
    endLocation: "",
    landmarkStart: "",
    landmarkEnd: ""
  });
  const [routeError, setRouteError] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);

  const filteredVehicles = liveVehicles.filter((v) => {
    const matchesType =
      selectedVehicleType === "Any" ||
      v.status === selectedVehicleType.toLowerCase();
    const matchesSearch =
      v.route.toLowerCase().includes(searchValue.toLowerCase());
    return matchesType && matchesSearch;
  });
  // Handler to open edit dialog
  const handleEdit = (vehicle: VehicleListItem) => {
    setEditVehicle(vehicle);
    setEditTitle(vehicle.title);
    setEditDialogOpen(true);
  };

  // Handler to save edit (stub, you can implement update logic)
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: update vehicle in your state/store
    setEditDialogOpen(false);
  };

  // Route management functions
  const handleAddRoutesClick = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setIsAddRouteDialogOpen(true);
    setShowAddRouteForm(false);
    setRoutes([]); // Reset routes for this vehicle
    setRouteError("");
  };

  const handleShowAddRouteForm = () => {
    setShowAddRouteForm(true);
    setNewRoute({
      startLocation: "",
      endLocation: "",
      landmarkStart: "",
      landmarkEnd: ""
    });
    setRouteError("");
  };

  const handleAddRoute = () => {
    if (!newRoute.startLocation || !newRoute.endLocation || !newRoute.landmarkStart || !newRoute.landmarkEnd) {
      setRouteError("Please fill in all fields.");
      return;
    }

    const route: Route = {
      id: (routes.length + 1).toString(),
      ...newRoute
    };

    setRoutes(prev => [...prev, route]);
    setNewRoute({
      startLocation: "",
      endLocation: "",
      landmarkStart: "",
      landmarkEnd: ""
    });
    setShowAddRouteForm(false);
    setRouteError("");
  };

  const handleNewRouteChange = (field: keyof Omit<Route, 'id'>, value: string) => {
    setNewRoute(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveRoute = (index: number) => {
    setRoutes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveRoutes = async () => {
    if (routes.length === 0) {
      setRouteError("Please add at least one route before saving.");
      return;
    }

    try {
      setRouteLoading(true);
      
      // Save routes to backend
      const routePayload = {
        vehicle_id: selectedVehicleId,
        routes: routes
      };

      console.log("🛣️ Saving routes for vehicle:", routePayload);

      const response = await fetch(`${apiBaseURL}/vehicles/${selectedVehicleId}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routePayload)
      });

      if (response.ok) {
        console.log("✅ Routes saved successfully");
        setIsAddRouteDialogOpen(false);
        setRoutes([]);
        setSelectedVehicleId("");
        alert("Routes saved successfully!");
      } else {
        console.error("❌ Failed to save routes");
        setRouteError("Failed to save routes. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error saving routes:", error);
      setRouteError("Error saving routes. Please try again.");
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">
        {/* Filter Section */}
        <div className="flex items-center justify-between gap-4 rounded-lg mb-4">
          {/* Left side - Search only */}
          <div className="flex items-center gap-4 flex-1">
            {/* Search Vehicle */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-card w-full pl-10 pr-4 py-2 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Right side - Filter Dropdown */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg bg-card text-foreground hover:bg-muted">
                  <ListFilter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{selectedVehicleType}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setSelectedVehicleType("Any")}>
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-2 align-middle" />
                  Any
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedVehicleType("Available")}>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 align-middle" />
                  Available
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedVehicleType("Full")}>
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2 align-middle" />
                  Full
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedVehicleType("Unavailable")}>
                  <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2 align-middle" />
                  Unavailable
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Vehicle Table */}
        {filteredVehicles.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-lg font-medium">No Vehicles</div>
        ) : (
          <VehicleListView
            vehicles={filteredVehicles.map((v) => ({
              id: v.id,
              title: v.route,
              subtitle: `${v.plate}`, // or use ETA if available
              status: getVehicleStatusFromData(v.status),
              statusColor: getStatusColorFromData(v.status),
              orderCompleted: v.available_seats,
              lastCheckIn: "N/A", // or use timestamp if available
              lastCheckInAgo: v.status === "available" ? "Available" : v.status === "full" ? "Full" : "Unavailable",
              maxLoad: `${v.available_seats} seats`,
              driver: v.driverName,
              onEdit: handleEdit,
              onAddRoutes: () => handleAddRoutesClick(v.id),
            }))}

          />
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Name</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <DialogFooter>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold"
                >
                  Save
                </button>
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 rounded-lg bg-muted text-foreground font-semibold">Cancel</button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Routes Dialog */}
        <Dialog open={isAddRouteDialogOpen} onOpenChange={setIsAddRouteDialogOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-none w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
                <Route className="w-6 h-6 text-blue-400" />
                Manage Routes for Vehicle
              </DialogTitle>
              <div className="text-gray-400 text-center text-sm">
                Add transportation routes for this vehicle. Define service coverage areas and enable accurate tracking.
              </div>
            </DialogHeader>
            
            <div className="p-6 pt-0 overflow-y-auto space-y-6">
              {/* Route Setup Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium text-sm mb-2">
                  Route Management Benefits:
                </h3>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Define vehicle service coverage areas</li>
                  <li>• Enable accurate vehicle tracking and routing</li>
                  <li>• Provide better service to passengers</li>
                  <li>• Optimize fleet operations</li>
                </ul>
              </div>

              {/* Add Route Form */}
              {showAddRouteForm && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">Add New Route</h3>
                    <Button
                      onClick={() => setShowAddRouteForm(false)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Location */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">Start Location</Label>
                      <Input
                        value={newRoute.startLocation}
                        onChange={(e) => handleNewRouteChange('startLocation', e.target.value)}
                        placeholder="Enter start location"
                        className="text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* End Location */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">End Location</Label>
                      <Input
                        value={newRoute.endLocation}
                        onChange={(e) => handleNewRouteChange('endLocation', e.target.value)}
                        placeholder="Enter end location"
                        className="text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Landmark Start */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">Landmark (Start)</Label>
                      <textarea
                        value={newRoute.landmarkStart}
                        onChange={(e) => handleNewRouteChange('landmarkStart', e.target.value)}
                        placeholder="Enter landmark at start location"
                        className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none text-white"
                        rows={2}
                      />
                    </div>

                    {/* Landmark End */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">Landmark (End)</Label>
                      <textarea
                        value={newRoute.landmarkEnd}
                        onChange={(e) => handleNewRouteChange('landmarkEnd', e.target.value)}
                        placeholder="Enter landmark at end location"
                        className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none text-white"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddRoute}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Route
                    </Button>
                    <Button
                      onClick={() => setShowAddRouteForm(false)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Current Routes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Vehicle Routes ({routes.length})</h3>
                  {!showAddRouteForm && (
                    <Button
                      onClick={handleShowAddRouteForm}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                      type="button"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Route
                    </Button>
                  )}
                </div>

                {routes.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-600 rounded-lg">
                    <Route className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No routes added yet</p>
                    <p className="text-gray-500 text-xs">Click "Add Route" to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {routes.map((route, index) => (
                      <div key={route.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-green-400" />
                              <span className="text-white font-medium">From:</span>
                              <span className="text-gray-300">{route.startLocation}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-red-400" />
                              <span className="text-white font-medium">To:</span>
                              <span className="text-gray-300">{route.endLocation}</span>
                            </div>
                            {route.landmarkStart && (
                              <div className="text-xs text-gray-400 ml-6">
                                Start landmark: {route.landmarkStart}
                              </div>
                            )}
                            {route.landmarkEnd && (
                              <div className="text-xs text-gray-400 ml-6">
                                End landmark: {route.landmarkEnd}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handleRemoveRoute(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error/Success Display */}
              {routeError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm font-medium">
                    {routeError}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddRouteDialogOpen(false)}
                  disabled={routeLoading}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRoutes}
                  disabled={routeLoading || routes.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 cursor-pointer disabled:opacity-50"
                >
                  {routeLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    `Save ${routes.length} Route${routes.length !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
}

// Helper functions for vehicle data
function getVehicleStatusFromData(status: string): string {
  switch (status) {
    case "available":
      return "Available";
    case "full":
      return "Full";
    case "unavailable":
      return "Unavailable";
    default:
      return status;
  }
}

function getStatusColorFromData(status: string): string {
  switch (status) {
    case "available":
      return "text-white bg-green-500";
    case "full":
      return "text-white bg-orange-500";
    case "unavailable":
      return "text-white bg-gray-500";
    default:
      return "text-white bg-gray-500";
  }
}
