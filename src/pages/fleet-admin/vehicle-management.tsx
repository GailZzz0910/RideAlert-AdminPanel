
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
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const fleetId = user?.id;    // or user?.fleet_id depending on backend
  const liveVehicles = useVehicleWebSocket(
    fleetId ? `${wsBaseURL}/ws/vehicles/all/${fleetId}` : null
  );
  const [searchValue, setSearchValue] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("Any");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<VehicleListItem | null>(null);
  const [editTitle, setEditTitle] = useState("");

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

  // Navigate to assign route page with vehicle data
  const handleAssignRoute = (vehicleId: string) => {
    const vehicleData = liveVehicles.find(v => v.id === vehicleId);
    navigate(`/dashboard/assign-route/${vehicleId}`, {
      state: { vehicleData }
    });
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
              onAssignRoute: () => handleAssignRoute(v.id),
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
