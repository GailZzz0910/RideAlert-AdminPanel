import { useUser } from "../context/userContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardCountCard } from "@/components/dashboard-count-card";
import { Car, CheckCircle, XCircle, AlertCircle, Search, ChevronDown, ListFilter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DashboardVehicleCard } from "@/components/dashboard-vehicle-card";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useVehicle } from "@/context/vehicleContext";
import { useVehicleWebSocket } from "@/components/useVehicleWebsocket";
import { wsBaseURL } from "@/utils/api";

export default function DashboardPage() {
  const liveVehicles = useVehicleWebSocket(`${wsBaseURL}/ws/vehicles/all`);
  const { user, token } = useUser();
  const [searchValue, setSearchValue] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState("Any");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("Current user:", user);
    console.log("Current token:", token);
  }, [user, token]);

  const { total, available, full, unavailable } = useVehicle();

  // Filter vehicles by type
  const filteredVehicles = liveVehicles.filter((v) => {
    const matchesType =
      selectedVehicleType === "Any" ||
      v.status === selectedVehicleType.toLowerCase();
    const matchesSearch =
      v.route.toLowerCase().includes(searchValue.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">

        {/* Vehicle Count Cards */}
        <div className="grid w-full gap-5 mb-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCountCard label="Total Vehicles" count={total} icon={<Car className="text-primary w-6 h-6" />} subtext={""} />
          <DashboardCountCard label="Available" count={available} icon={<CheckCircle className="text-primary w-6 h-6" />} percent={total > 0 ? Math.round((available / total) * 100) : 0} />
          <DashboardCountCard label="Full" count={full} icon={<XCircle className="text-primary w-6 h-6" />} percent={total > 0 ? Math.round((full / total) * 100) : 0} />
          <DashboardCountCard label="Unavailable" count={unavailable} icon={<AlertCircle className="text-primary w-6 h-6" />} percent={total > 0 ? Math.round((unavailable / total) * 100) : 0} />
        </div>

        {/* Header with title and count */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            All vehicles
            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {total}
            </span>
          </h2>
        </div>

        {/* Filter Section */}
        <div className="flex items-center justify-between gap-4 rounded-lg">
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

          {/* Right side - Filter Dropdown and View Toggle */}
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

        {/* Vehicle Display */}
        {loading ? (
          <div className="flex items-center justify-center h-[350px] w-full">
            <div className="w-16 h-16 border-5 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-lg font-medium">No Vehicles</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6 2xl:gap-5 xl:gap-8 mb-10">
            {filteredVehicles.map((v) => (
              <DashboardVehicleCard
                key={v.id}
                title={v.route}
                subtitle={`ETA: unknown`} // Replace with real ETA if available
                status={getVehicleStatusFromData(v.status)}
                statusColor={getStatusColorFromData(v.status)}
                orderCompleted={v.available_seats}
                lastCheckIn={"N/A"}
                lastCheckInAgo={v.status === 'available' ? 'Available' : v.status === 'full' ? 'Full' : 'Unavailable'}
                maxLoad={"30 seats"} // Or use dynamic value
                driver={v.driverName}
              />
            ))}
          </div>
        )}
      </div>
    </ScrollArea>

  );
}

// Helper functions for vehicle data
function getVehicleStatusFromData(status: string): string {
  switch (status) {
    case 'available':
      return 'Available';
    case 'full':
      return 'Full';
    case 'unavailable':
      return 'Unavailable';
    default:
      return status;
  }
}

function getStatusColorFromData(status: string): string {
  switch (status) {
    case 'available':
      return "text-white bg-green-500";
    case 'full':
      return "text-white bg-orange-500";
    case 'unavailable':
      return "text-white bg-gray-500";
    default:
      return "text-white bg-gray-500";
  }
}
