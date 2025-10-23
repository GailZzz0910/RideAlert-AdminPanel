import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser } from "@/context/userContext";
import { apiBaseURL } from "@/utils/api";
import {
  Plus,
  MapPin,
  Route,
  X,
  Trash2,
  Search,
  Edit,
  CheckCircle,
  Clock,
  RefreshCw,
  Loader2
} from "lucide-react";

// Update the Route interface to match backend response
interface Route {
  _id?: string;
  id: string;
  company_id: string;
  start_location: string;
  end_location: string;
  landmark_details_start: string;
  landmark_details_end: string;
  route_geojson: any;
  company_name: string;
  status?: "draft" | "saved";
  createdAt?: string;
  // Frontend transformed properties
  startLocation: string;
  endLocation: string;
  landmarkStart: string;
  landmarkEnd: string;
}

export default function AddRoutes() {
  const { user, token } = useUser(); // Get token from context
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([]);
  const [pendingRoutes, setPendingRoutes] = useState<Route[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const [newRoute, setNewRoute] = useState({
    id: "",
    start_location: "",
    end_location: "",
    landmark_details_start: "",
    landmark_details_end: "",
    status: "draft" as "draft",
  });

  const [editForm, setEditForm] = useState<Route>({
    id: "",
    company_id: "",
    start_location: "",
    end_location: "",
    landmark_details_start: "",
    landmark_details_end: "",
    route_geojson: null,
    company_name: "",
    status: "draft",
    startLocation: "",
    endLocation: "",
    landmarkStart: "",
    landmarkEnd: "",
  });

  // Fetch routes from backend
  const fetchRoutes = async () => {
    if (!user?.id || !token) {
      setFetchError("User not authenticated");
      return;
    }

    setFetchLoading(true);
    setFetchError(null);

    try {
      const response = await fetch(`${apiBaseURL}/declared_routes/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login again");
        }
        throw new Error(`Failed to fetch routes: ${response.statusText}`);
      }

      const routes: any[] = await response.json();

      // Transform backend data to match frontend structure
      const transformedRoutes: Route[] = routes.map(route => {
        console.log("Raw route from backend:", route); // Debug
        return {
          ...route,
          _id: route.id || route._id,  // Use id field (which comes from backend's _id)
          id: route.id || route._id,    // Ensure id is set
          startLocation: route.start_location,
          endLocation: route.end_location,
          landmarkStart: route.landmark_details_start,
          landmarkEnd: route.landmark_details_end,
          status: "saved" as const,
          createdAt: route.createdAt || new Date().toISOString(),
        };
      });

      console.log("Transformed routes:", transformedRoutes);
      setSavedRoutes(transformedRoutes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      setFetchError(error instanceof Error ? error.message : "Failed to fetch routes");
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch routes on component mount and when user changes
  useEffect(() => {
    if (user?.id && token) {
      fetchRoutes();
    }
  }, [user?.id, token]);

  // Handle new route input changes
  const handleNewRouteChange = (field: keyof typeof newRoute, value: string) => {
    setNewRoute(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show add route dialog
  const handleShowAddRouteDialog = () => {
    setIsDialogOpen(true);
    setPendingRoutes([]);
    setRouteError(null);
  };

  // Close dialog and reset form
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setPendingRoutes([]);
    setNewRoute({
      id: "",
      start_location: "",
      end_location: "",
      landmark_details_start: "",
      landmark_details_end: "",
      status: "draft",
    });
    setRouteError(null);
  };

  // Add route to pending list in dialog
  const handleAddRouteToPending = async () => {
    if (!newRoute.start_location.trim() || !newRoute.end_location.trim()) {
      setRouteError("Start and end locations are required");
      return;
    }

    setAddLoading(true);
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const routeToAdd: Route = {
        ...newRoute,
        id: Date.now().toString(),
        company_id: user?.id || "",
        company_name: user?.company_name || "Your Company",
        route_geojson: null,
        status: "draft",
        createdAt: new Date().toISOString(),
        startLocation: newRoute.start_location,
        endLocation: newRoute.end_location,
        landmarkStart: newRoute.landmark_details_start,
        landmarkEnd: newRoute.landmark_details_end,
      };

      setPendingRoutes(prev => [...prev, routeToAdd]);

      // Reset form for next route
      setNewRoute({
        id: "",
        start_location: "",
        end_location: "",
        landmark_details_start: "",
        landmark_details_end: "",
        status: "draft",
      });
      setRouteError(null);
    } catch (error) {
      console.error("Error adding route to pending:", error);
      setRouteError("Failed to add route to list");
    } finally {
      setAddLoading(false);
    }
  };

  // Remove route from pending list
  const handleRemoveFromPending = (routeId: string) => {
    setPendingRoutes(prev => prev.filter(route => route.id !== routeId));
  };

  // Remove route from main table and backend
  const handleRemoveRoute = async (routeId: string) => {
    try {
      if (!token) {
        setRouteError("No authentication token found");
        return;
      }

      const res = await fetch(`${apiBaseURL}/declared_routes/${routeId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized - Please login again");
        }
        if (res.status === 404) {
          throw new Error("Route not found");
        }
        const err = await res.json();
        throw new Error(err.detail || `Failed to delete route: ${res.statusText}`);
      }

      const result = await res.json();

      if (result.deleted) {
        setSavedRoutes(prev => prev.filter(route => route.id !== routeId));
      } else {
        throw new Error("Failed to delete route");
      }
    } catch (error) {
      console.error("Error deleting route:", error);
      setRouteError(error instanceof Error ? error.message : "Failed to delete route");
      throw error; // Re-throw to handle in the confirmation function
    }
  };

  // Save all pending routes to backend and move to main table
  const handleSaveCreatedRoutes = async () => {
    if (!user?.id || !token) {
      setRouteError("User not authenticated");
      return;
    }

    if (pendingRoutes.length === 0) {
      setRouteError("No routes to save");
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    try {
      for (const route of pendingRoutes) {
        const formData = new FormData();
        formData.append("company_id", user.id);
        formData.append("start_location", route.start_location);
        formData.append("end_location", route.end_location);
        formData.append("landmark_details_start", route.landmark_details_start || "");
        formData.append("landmark_details_end", route.landmark_details_end || "");

        const res = await fetch(`${apiBaseURL}/declared_routes/route-register`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Unauthorized - Please login again");
          }
          const err = await res.json();
          throw new Error(err.detail || `Failed to save route: ${res.statusText}`);
        }

        await res.json();
      }

      // Refresh routes from backend after saving
      await fetchRoutes();

      // Clear pending routes and close dialog
      setPendingRoutes([]);
      handleCloseDialog();

      alert(`${pendingRoutes.length} route${pendingRoutes.length !== 1 ? "s" : ""} saved successfully!`);
    } catch (error) {
      console.error("Error saving routes:", error);
      setRouteError(error instanceof Error ? error.message : "Failed to save routes");
    } finally {
      setRouteLoading(false);
    }
  };

  // Filter routes based on search (only for main table)
  const filteredRoutes = savedRoutes.filter((route) => {
    const matchesSearch =
      route.startLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      route.endLocation.toLowerCase().includes(searchValue.toLowerCase()) ||
      route.landmarkStart.toLowerCase().includes(searchValue.toLowerCase()) ||
      route.landmarkEnd.toLowerCase().includes(searchValue.toLowerCase());

    return matchesSearch;
  });

  // Handle edit route
  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setEditForm({ ...route });
    setIsEditMode(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    setEditLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Optional: Update backend here if you have an update endpoint
      // const response = await fetch(`${apiBaseURL}/declared_routes/${editForm.id}`, {
      //   method: "PUT",
      //   headers: { 
      //     "Content-Type": "application/json",
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(editForm)
      // });

      setSavedRoutes(prev =>
        prev.map(route =>
          route.id === selectedRoute?.id ? editForm : route
        )
      );
      setSelectedRoute({ ...editForm });
      setIsEditMode(false);
      alert("Route updated successfully!");
    } catch (error) {
      console.error("Error updating route:", error);
      setRouteError("Failed to update route");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm({
      id: "",
      company_id: "",
      start_location: "",
      end_location: "",
      landmark_details_start: "",
      landmark_details_end: "",
      route_geojson: null,
      company_name: "",
      status: "draft",
      startLocation: "",
      endLocation: "",
      landmarkStart: "",
      landmarkEnd: "",
    });
  };

  // Handle delete with confirmation
  const confirmAndDeleteRoute = async (route: Route) => {
    console.log("Route to delete:", route); // Debug log
    console.log("Route _id:", route._id);   // Debug log
    console.log("Route id:", route.id);     // Debug log

    const confirmed = window.confirm(
      `Are you sure you want to delete the route from "${route.startLocation}" to "${route.endLocation}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      const routeId = route._id || route.id;
      console.log("Using route ID:", routeId); // Debug log

      if (!routeId || routeId === 'undefined') {
        alert("Error: Invalid route ID");
        return;
      }

      setDeleteLoading(route.id);
      try {
        await handleRemoveRoute(routeId);
        alert("Route deleted successfully!");
      } catch (error) {
        console.error("Delete failed:", error);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Skeleton components
  const SummaryCardSkeleton = () => (
    <Card className="flex-1 min-w-[250px]">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div>
            <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
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
          <Route className="w-5 h-5" />
          <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Start Location</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">End Location</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Start Landmark</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">End Landmark</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
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

        <h1 className="text-3xl font-bold text-foreground">Optimize Fleet Coverage</h1>
        <p className="text-muted-foreground">Efficiently add and manage multiple routes for your fleet company.</p>

        {/* Loading and Error States */}
        {fetchLoading && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-blue-400 text-sm font-medium">
              Loading routes...
            </p>
          </div>
        )}

        {fetchError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm font-medium">
              {fetchError}
            </p>
            <Button
              onClick={fetchRoutes}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Summary Stats */}
        {fetchLoading ? (
          <div className="flex flex-wrap gap-4">
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            <Card className="flex-1 min-w-[250px]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Route className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Routes</p>
                    <p className="text-2xl font-bold text-foreground">{savedRoutes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[250px]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Locations</p>
                    <p className="text-2xl font-bold text-foreground">
                      {new Set([...savedRoutes.map(r => r.startLocation), ...savedRoutes.map(r => r.endLocation)]).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[250px]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recent Routes</p>
                    <p className="text-2xl font-bold text-foreground">
                      {savedRoutes.filter(r => r.createdAt && new Date(r.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search routes by location or landmark..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Refresh Button */}
          <Button
            onClick={fetchRoutes}
            variant="outline"
            disabled={fetchLoading}
            className="cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${fetchLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Add Route Button */}
          <Button
            onClick={handleShowAddRouteDialog}
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Route
          </Button>
        </div>

        {/* Routes Table */}
        {fetchLoading ? (
          <TableSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5" />
                Routes ({filteredRoutes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Start Location</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">End Location</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Start Landmark</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">End Landmark</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredRoutes.map((route) => (
                    <tr
                      key={route.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td
                        className="py-4 px-4 cursor-pointer"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-foreground">{route.startLocation}</span>
                        </div>
                      </td>
                      <td
                        className="py-4 px-4 cursor-pointer"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-400" />
                          <span className="font-medium text-foreground">{route.endLocation}</span>
                        </div>
                      </td>
                      <td
                        className="py-4 px-4 cursor-pointer"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <span className="text-muted-foreground">{route.landmarkStart || "N/A"}</span>
                      </td>
                      <td
                        className="py-4 px-4 cursor-pointer"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <span className="text-muted-foreground">{route.landmarkEnd || "N/A"}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRoute(route);
                            }}
                            disabled={editLoading}
                          >
                            {editLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Edit className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              confirmAndDeleteRoute(route);
                            }}
                            disabled={deleteLoading === route.id}
                          >
                            {deleteLoading === route.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRoutes.length === 0 && !fetchLoading && (
              <div className="text-center py-8">
                <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No routes found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchValue
                    ? "Try adjusting your search criteria."
                    : "No routes available. Click 'Add Route' to create your first route."}
                </p>
                {!searchValue && (
                  <Button
                    onClick={handleShowAddRouteDialog}
                    variant="outline"
                    className="mt-4 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Route
                  </Button>
                )}
              </div>
            )}

            {/* Error Display */}
            {routeError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
                <p className="text-red-400 text-sm font-medium">
                  {routeError}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Add Route Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-black/90 backdrop-blur-xl border-none w-full max-w-4xl h-[85vh] flex flex-col">
            <DialogHeader className="pb-4 flex-shrink-0">
              <DialogTitle className="text-white text-2xl text-center flex items-center justify-center gap-2">
                <Route className="w-6 h-6 text-blue-400" />
                Add New Routes
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col space-y-6">
              {/* Route Form */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 flex-shrink-0">
                <h3 className="text-white text-lg font-semibold mb-4">Create Route</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white text-sm font-medium">Start Location *</Label>
                    <Input
                      value={newRoute.start_location}
                      onChange={(e) => handleNewRouteChange('start_location', e.target.value)}
                      placeholder="Enter start location"
                      className="text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm font-medium">End Location *</Label>
                    <Input
                      value={newRoute.end_location}
                      onChange={(e) => handleNewRouteChange('end_location', e.target.value)}
                      placeholder="Enter end location"
                      className="text-white bg-white/10 border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm font-medium">Start Landmark</Label>
                    <textarea
                      value={newRoute.landmark_details_start}
                      onChange={(e) => handleNewRouteChange('landmark_details_start', e.target.value)}
                      placeholder="Enter landmark at start location"
                      className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none text-white"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-sm font-medium">End Landmark</Label>
                    <textarea
                      value={newRoute.landmark_details_end}
                      onChange={(e) => handleNewRouteChange('landmark_details_end', e.target.value)}
                      placeholder="Enter landmark at end location"
                      className="w-full px-3 py-2 border border-white/20 bg-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none text-white"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleAddRouteToPending}
                    disabled={addLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    {addLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to List
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Route Summary */}
              {pendingRoutes.length > 0 && (
                <div className="bg-white/5 rounded-lg border border-white/10 flex flex-col min-h-0 flex-1">
                  <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
                    <h3 className="text-white text-lg font-semibold">Route Summary ({pendingRoutes.length})</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {pendingRoutes.length} route{pendingRoutes.length !== 1 ? 's' : ''} ready
                    </Badge>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="space-y-3">
                      {pendingRoutes.map((route) => (
                        <div key={route.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-green-400" />
                                <span className="text-white font-medium">{route.start_location}</span>
                                <span className="text-white/60">→</span>
                                <MapPin className="w-4 h-4 text-red-400" />
                                <span className="text-white font-medium">{route.end_location}</span>
                              </div>
                              {(route.landmark_details_start || route.landmark_details_end) && (
                                <div className="text-sm text-white/70">
                                  {route.landmark_details_start && <span>Start: {route.landmark_details_start}</span>}
                                  {route.landmark_details_start && route.landmark_details_end && <span> | </span>}
                                  {route.landmark_details_end && <span>End: {route.landmark_details_end}</span>}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFromPending(route.id)}
                              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {routeError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex-shrink-0">
                  <p className="text-red-400 text-sm font-medium">
                    {routeError}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6 flex-shrink-0">
              <div className="flex gap-3 w-full">
                <Button
                  onClick={handleCloseDialog}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveCreatedRoutes}
                  disabled={pendingRoutes.length === 0 || routeLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {routeLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save {pendingRoutes.length} Route{pendingRoutes.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Route Details Dialog */}
        <Dialog
          open={selectedRoute !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRoute(null);
              setIsEditMode(false);
              setEditForm({
                id: "",
                company_id: "",
                start_location: "",
                end_location: "",
                landmark_details_start: "",
                landmark_details_end: "",
                route_geojson: null,
                company_name: "",
                status: "draft",
                startLocation: "",
                endLocation: "",
                landmarkStart: "",
                landmarkEnd: "",
              });
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedRoute && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5 text-blue-600" />
                    {isEditMode ? 'Edit Route' : 'Route Details'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Route Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Start Location *</Label>
                        {isEditMode ? (
                          <Input
                            value={editForm.startLocation}
                            onChange={(e) => setEditForm({ ...editForm, startLocation: e.target.value })}
                            placeholder="Enter start location"
                          />
                        ) : (
                          <p className="font-medium">{selectedRoute.startLocation || "Not specified"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">End Location *</Label>
                        {isEditMode ? (
                          <Input
                            value={editForm.endLocation}
                            onChange={(e) => setEditForm({ ...editForm, endLocation: e.target.value })}
                            placeholder="Enter end location"
                          />
                        ) : (
                          <p className="font-medium">{selectedRoute.endLocation || "Not specified"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Start Landmark</Label>
                        {isEditMode ? (
                          <textarea
                            value={editForm.landmarkStart}
                            onChange={(e) => setEditForm({ ...editForm, landmarkStart: e.target.value })}
                            placeholder="Enter landmark at start location"
                            className="w-full px-3 py-2 border border-input rounded-lg resize-none"
                            rows={2}
                          />
                        ) : (
                          <p className="font-medium">{selectedRoute.landmarkStart || "Not specified"}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">End Landmark</Label>
                        {isEditMode ? (
                          <textarea
                            value={editForm.landmarkEnd}
                            onChange={(e) => setEditForm({ ...editForm, landmarkEnd: e.target.value })}
                            placeholder="Enter landmark at end location"
                            className="w-full px-3 py-2 border border-input rounded-lg resize-none"
                            rows={2}
                          />
                        ) : (
                          <p className="font-medium">{selectedRoute.landmarkEnd || "Not specified"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    {isEditMode ? (
                      <>
                        <Button
                          className="flex-1 cursor-pointer"
                          onClick={handleSaveEdit}
                          disabled={editLoading}
                        >
                          {editLoading ? (
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
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          setEditForm({ ...selectedRoute });
                          setIsEditMode(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Route
                      </Button>
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