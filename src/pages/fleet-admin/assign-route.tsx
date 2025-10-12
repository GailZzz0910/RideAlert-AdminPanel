import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Route,
  X,
  Plus,
  ArrowLeft,
  Check,
  Clock,
  Navigation,
} from "lucide-react";
import { useUser } from "@/context/userContext";
import { apiBaseURL } from "@/utils/api";
import type { VehicleData } from "@/components/useVehicleWebsocket";

interface Route {
  id: string;
  startLocation: string;
  endLocation: string;
  landmarkStart: string;
  landmarkEnd: string;
  isSelected?: boolean;
}

export default function AssignRoute() {
  const { vehicle_id } = useParams<{ vehicle_id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useUser();

  // Get vehicle data from navigation state
  const vehicleData = location.state?.vehicleData as VehicleData | null;

  // State management
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Mock route data for demonstration
  const mockRoutes: Route[] = [
    {
      id: "1",
      startLocation: "Quezon City",
      endLocation: "Makati City",
      landmarkStart: "Quezon Memorial Circle",
      landmarkEnd: "Ayala Center"
    },
    {
      id: "2",
      startLocation: "Manila",
      endLocation: "Pasig City",
      landmarkStart: "Rizal Park",
      landmarkEnd: "Emerald Avenue"
    },
    {
      id: "3",
      startLocation: "Taguig City",
      endLocation: "Mandaluyong City",
      landmarkStart: "BGC Central Plaza",
      landmarkEnd: "SM Megamall"
    },
    {
      id: "4",
      startLocation: "Paranaque City",
      endLocation: "Las Pinas City",
      landmarkStart: "SM Sucat",
      landmarkEnd: "Alabang Town Center"
    },
    {
      id: "5",
      startLocation: "Muntinlupa City",
      endLocation: "Caloocan City",
      landmarkStart: "Ayala Alabang",
      landmarkEnd: "LRT Monumento"
    }
  ];

  useEffect(() => {
    // Load available routes data
    setAvailableRoutes(mockRoutes);
  }, []);

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500 text-white";
      case "full":
        return "bg-orange-500 text-white";
      case "unavailable":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Helper function to get status display text
  const getStatusText = (status: string) => {
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
  };

  // Filter routes based on search
  const filteredRoutes = availableRoutes.filter((route) => {
    const matchesSearch =
      route.startLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      route.endLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      route.landmarkStart.toLowerCase().includes(searchValue.toLowerCase()) ||
      route.landmarkEnd.toLowerCase().includes(searchValue.toLowerCase());
    return matchesSearch;
  });

  const handleRouteSelect = (route: Route) => {
    const isSelected = selectedRoutes.some(r => r.id === route.id);
    if (isSelected) {
      // If clicking the already selected route, deselect it
      setSelectedRoutes([]);
    } else {
      // Replace any existing selection with the new route (only one route allowed)
      setSelectedRoutes([route]);
    }
  };

  const handleAssignRoutes = async () => {
    if (selectedRoutes.length === 0) {
      setError("Please select a route to assign.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        vehicle_id: vehicle_id,
        route_ids: selectedRoutes.map(r => r.id)
      };

      console.log("🚗 Assigning route to vehicle:", payload);

      // For testing purposes, you can uncomment the lines below to mock the API response
      // and comment out the actual fetch call
      /*
      // Mock successful response for testing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setSuccess(`Successfully assigned route to vehicle ${vehicleData?.plate}`);
      setShowConfirmDialog(true);
      return;
      */

      const response = await fetch(`${apiBaseURL}/assign-route/${vehicle_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(`Successfully assigned route to vehicle ${vehicleData?.plate}`);
        setShowConfirmDialog(true);
      } else {
        setError("Failed to assign route. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error assigning routes:", error);
      setError("Error assigning route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndReturn = () => {
    setShowConfirmDialog(false);
    navigate('/dashboard/vehicle-management');
  };

  if (!vehicleData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-muted-foreground">Loading vehicle information...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen w-full">
      <div className="bg-black/90 backdrop-blur-xl min-h-screen">
        <div className="flex flex-col min-h-screen w-full max-w-6xl mx-auto gap-6 px-7 text-card-foreground p-5">
          {/* Header Section */}
          

          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Route className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Assign Routes</h1>
            </div>
            <p className="text-gray-400 text-lg">
              Select a route to assign to vehicle <span className="text-blue-400 font-medium">{vehicleData.plate}</span>
            </p>
          </div>

          {/* Vehicle Information Card */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-400" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Plate Number</p>
                  <p className="text-white font-medium">{vehicleData.plate}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <Badge className={`${getStatusColor(vehicleData.status)} font-medium`}>
                    {getStatusText(vehicleData.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Current Route</p>
                  <p className="text-white font-medium">{vehicleData.route}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Available Seats</p>
                  <p className="text-white font-medium">{vehicleData.available_seats} seats</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Driver</p>
                  <p className="text-white font-medium">{vehicleData.driverName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Selected Routes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Routes Section */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Route className="w-5 h-5 text-blue-400" />
                      Available Routes ({filteredRoutes.length})
                    </span>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search routes..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredRoutes.map((route) => {
                      const isSelected = selectedRoutes.some(r => r.id === route.id);
                      return (
                        <div
                          key={route.id}
                          onClick={() => handleRouteSelect(route)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-gray-600 bg-gray-700/50 hover:bg-gray-700"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-green-400" />
                                <span className="text-white font-medium">From:</span>
                                <span className="text-gray-300">{route.startLocation}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-red-400" />
                                <span className="text-white font-medium">To:</span>
                                <span className="text-gray-300">{route.endLocation}</span>
                              </div>
                              <div className="text-xs text-gray-400 ml-6">
                                <p>Start: {route.landmarkStart}</p>
                                <p>End: {route.landmarkEnd}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredRoutes.length === 0 && (
                    <div className="text-center py-8">
                      <Route className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No routes found</p>
                      <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Selected Routes Section */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/50 border-gray-700 h-96">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    Selected Route ({selectedRoutes.length}/1)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <div className="space-y-3 h-64 overflow-y-auto">
                    {selectedRoutes.map((route) => (
                      <div key={route.id} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-blue-300 text-sm font-medium">
                              {route.startLocation} → {route.endLocation}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRouteSelect(route)}
                            className="text-gray-400 hover:text-gray-300 p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {selectedRoutes.length === 0 && (
                      <div className="text-center py-6">
                        <Plus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No route selected</p>
                        <p className="text-gray-500 text-xs">Click on a route to select it</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Assign Button outside the container */}
              <div className="mt-4">
                <Button
                  onClick={handleAssignRoutes}
                  disabled={loading || selectedRoutes.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Assigning...
                    </div>
                  ) : (
                    selectedRoutes.length > 0 ? 'Assign Selected Route' : 'Select a Route to Assign'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && !showConfirmDialog && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/vehicle-management')}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Back to Vehicle Management
            </Button>
          </div>

          {/* Success Confirmation Dialog */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent className="bg-black/90 backdrop-blur-xl border-none">
              <DialogHeader className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <DialogTitle className="text-white text-xl">Route Successfully Assigned!</DialogTitle>
                <p className="text-gray-400 mt-2">
                  The selected route has been assigned to vehicle {vehicleData.plate}.
                </p>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <Button
                  onClick={handleConfirmAndReturn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  Return to Vehicle Management
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ScrollArea>
  );
}