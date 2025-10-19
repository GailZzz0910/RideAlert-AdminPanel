import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardVehicleCard } from "@/components/dashboard-vehicle-card";
import { useVehicleWebSocket } from "@/components/useVehicleWebsocket";
import { useUser } from "@/context/userContext";
import { wsBaseURL } from "@/utils/api";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icon
const vehicleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default center (Cagayan de Oro, Philippines)
const center: [number, number] = [8.4803, 124.6498];

type ViewMode = "all" | "specific";

export default function TrackingPage() {
  const [activeView, setActiveView] = useState<ViewMode>("all");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { user } = useUser();
  
  const fleetId = user?.id;
  const liveVehicles = useVehicleWebSocket(
    `${wsBaseURL}/ws/vehicles/all/${fleetId}`
  );

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Geolocation error:", error);
        // Set default location (Cagayan de Oro)
        setUserLocation({
          latitude: 8.4606,
          longitude: 124.6326,
        });
      }
    );
  }, []);

  // Helper functions for vehicle data
  const getVehicleStatusFromData = (status: string): string => {
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
  };

  const getStatusColorFromData = (status: string): string => {
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
  };

  // Filter vehicles for specific view
  const filteredVehicles = activeView === "specific" 
    ? liveVehicles.filter(v => v.status === "available")
    : liveVehicles;

  return (
    <ScrollArea className="h-screen w-full">
      <div className="flex flex-col min-h-screen w-full flex-1 gap-6 px-7 bg-background text-card-foreground p-5 mb-10">
        
        {/* Toggle Navigation - Centered and Large Width */}
        <div className="flex justify-center w-full">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView("all")}
                  className={`flex-1 px-6 py-3 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                    activeView === "all"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  Specific Vehicles
                </button>
                <button
                  onClick={() => setActiveView("specific")}
                  className={`flex-1 px-6 py-3 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                    activeView === "specific"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  All Available Vehicles
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header with descriptive title */}
        <div className="flex flex-col gap-2">
          {activeView === "all" ? (
            <div>
              <h2 className="text-xl font-semibold text-foreground">Specific Vehicles View</h2>
              <p className="text-muted-foreground">
                Oversee all PUVs in your fleet with real-time tracking information.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-foreground">Available Vehicles View</h2>
              <p className="text-muted-foreground">
                Track available PUVs on the map with real-time location updates.
              </p>
            </div>
          )}
        </div>

        {/* Vehicle Display */}
        {activeView === "all" ? (
          /* All Vehicles View - Show Vehicle Cards */
          filteredVehicles.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-lg font-medium">
              No Vehicles Found
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 md:gap-6 mb-10">
              {filteredVehicles.map((v) => (
                <div key={v.id} className="flex-shrink-0 min-w-[280px] max-w-[350px]">
                  <DashboardVehicleCard
                    id={v.id}
                    title={v.route}
                    subtitle={v}
                    status={getVehicleStatusFromData(v.status)}
                    statusColor={getStatusColorFromData(v.status)}
                    orderCompleted={v.available_seats}
                    lastCheckIn={"N/A"}
                    lastCheckInAgo={v.status === 'available' ? 'Available' : v.status === 'full' ? 'Full' : 'Unavailable'}
                    maxLoad={"30 seats"}
                    driver={v.driverName}
                    userLocation={userLocation}
                  />
                </div>
              ))}
            </div>
          )
        ) : (
          /* Available Vehicles Map View */
          <div className="h-[calc(100vh-300px)] w-full rounded-lg overflow-hidden border">
            <MapContainer
              {...({ center: center as any, zoom: 13, style: { height: '100%', width: '100%' }, zoomControl: true } as any)}
            >
              <TileLayer
                {...({ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' } as any)}
              />
              
              {/* Add markers for available vehicles */}
              {filteredVehicles.map((vehicle) => (
                vehicle.location && (
                  <Marker
                    key={vehicle.id}
                    {...({ position: [vehicle.location.latitude, vehicle.location.longitude], icon: vehicleIcon } as any)}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold">{vehicle.route}</h3>
                        <p className="text-sm">Driver: {vehicle.driverName}</p>
                        <p className="text-sm">Status: {getVehicleStatusFromData(vehicle.status)}</p>
                        <p className="text-sm">Available Seats: {vehicle.available_seats}</p>
                        <p className="text-sm">Plate: {vehicle.plate}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}