import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/utils/api";
import { useUser } from "@/context/userContext";

const statuses = ["Available", "Unavailable", "In Service", "Maintenance"];

export default function AddVehicle() {
  const [routes, setRoutes] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(statuses[0]);
  const [plate, setPlate] = useState("");
  const [driver, setDriver] = useState("");
  const [capacity, setCapacity] = useState("30");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useUser();

  // 🔹 Fetch routes dynamically from backend
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/declared_routes/routes/${user.id}`);
        // Example response: [{ start_location: "Villa", end_location: "Cogon" }]
        const formattedRoutes = res.data.map(
          (r: any) => `${r.start_location} - ${r.end_location}`
        );

        setRoutes(formattedRoutes);
        if (formattedRoutes.length > 0) {
          setSelectedRoute(formattedRoutes[0]);
        }
      } catch (err: any) {
        console.error("Failed to load routes:", err.response?.data || err.message);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      console.error("No fleet_id found for user");
      alert("User authentication error. Please refresh and try again.");
      return;
    }

    setSaving(true);

    const payload = {
      location: { latitude: 8.654321, longitude: 124.123456 },
      vehicle_type: "newPUV",
      capacity: Number(capacity),
      available_seats: Number(capacity),
      status: selectedStatus.toLowerCase(),
      route: selectedRoute,
      driverName: driver,
      plate,
    };

    try {
      const res = await api.post(`/vehicles/create/${user.id}`, payload);
      console.log("Vehicle added:", res.data);

      // Reset form
      setPlate("");
      setDriver("");
      setCapacity("30");
      if (routes.length > 0) setSelectedRoute(routes[0]);
      setSelectedStatus(statuses[0]);
      
      alert("Vehicle added successfully!");
    } catch (err: any) {
      console.error("Failed to add vehicle:", err.response?.data || err.message);
      alert("Failed to add vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Skeleton components
  const FormSkeleton = () => (
    <div className="flex flex-col gap-7 justify-center h-full md:col-span-1">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex flex-col gap-2 animate-pulse">
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <ScrollArea className="bg-background h-screen w-full">
        <div className="flex w-full h-full flex-1 items-center justify-center text-card-foreground">
          <div className="flex flex-col justify-between w-full h-full rounded-xl p-12">
            <div className="flex w-full justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-6">
                  Loading form data...
                </p>
              </div>
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start flex-1">
              <FormSkeleton />
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="bg-background h-screen w-full">
      <div className="flex w-full h-full flex-1 items-center justify-center text-card-foreground">
        <div className="flex flex-col justify-between w-full h-full rounded-xl p-12 pt-16">
          <div className="flex w-full justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Fill in the details below to add a new vehicle.
              </p>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
              form="add-vehicle-form"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Vehicle...
                </>
              ) : (
                'Save Vehicle'
              )}
            </Button>
          </div>

          <form
            id="add-vehicle-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start flex-1"
          >
            <div className="flex flex-col gap-7 justify-center h-full md:col-span-1">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plate">Plate:</Label>
                <Input
                  id="plate"
                  type="text"
                  placeholder="Enter vehicle plate number"
                  required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  disabled={saving}
                  className="bg-card"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="driver">Driver:</Label>
                <Input
                  id="driver"
                  type="text"
                  placeholder="Enter driver name"
                  required
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  disabled={saving}
                  className="bg-card"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="route">Route Assigned:</Label>
                <Select
                  value={selectedRoute}
                  onValueChange={setSelectedRoute}
                  disabled={routes.length === 0 || saving}
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue
                      placeholder={
                        routes.length === 0
                          ? "No declared routes available"
                          : "Select route"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {routes.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="flex flex-col gap-2">
                <Label htmlFor="capacity">Capacity:</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  placeholder="Enter capacity"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="bg-card"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status:</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              <div className="flex flex-col gap-2">
                <Label>Current Location:</Label>
                <span className="text-base font-medium">
                  Auto-detect via GPS
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#888" />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dy=".3em"
                      fontSize="8"
                      fill="#fff"
                    >
                      i
                    </text>
                  </svg>
                  ETA will be calculated automatically based on GPS data
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ScrollArea>
  );
}
