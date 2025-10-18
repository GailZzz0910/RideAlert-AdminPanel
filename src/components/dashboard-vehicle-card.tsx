import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { useVehicleETA } from "@/hooks/useVehicleETA";

export interface DashboardVehicleCardProps {
  id: string;
  title: string;
  subtitle: any; // Vehicle object
  status: string;
  statusColor: string;
  orderCompleted: number;
  lastCheckIn?: string;
  lastCheckInAgo?: string;
  maxLoad: string;
  driver: string;
  className?: string;
  userLocation: { latitude: number; longitude: number } | null;
}

export const DashboardVehicleCard: React.FC<DashboardVehicleCardProps> = ({
  id,
  title,
  subtitle,
  status,
  statusColor,
  orderCompleted,
  maxLoad,
  driver,
  userLocation,
  className,
}) => {
  const navigate = useNavigate();
  const { etaData, loading, error } = useVehicleETA({
    vehicleId: id,
    userLocation,
  });

  const handleMapClick = () => {
    navigate(`/dashboard/maps?vehicleId=${id}`);
  };

  const etaDisplay = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">Calculating...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center gap-1 text-red-500">
          <AlertCircle className="w-3 h-3" />
          <span className="text-xs">Error</span>
        </div>
      );
    }

    if (etaData) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {etaData.eta_formatted}
          </span>
          <span className="text-xs text-muted-foreground">
            {etaData.distance_km.toFixed(1)} km away
          </span>
        </div>
      );
    }

    return <span className="text-sm text-muted-foreground">N/A</span>;
  }, [etaData, loading, error]);

  return (
    <Card className={cn("w-full bg-card border-border", className)}>
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground leading-tight">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{driver}</p>
            </div>
            <span
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap border",
                statusColor
              )}
            >
              {status}
            </span>
          </div>

          <div className="border-t border-border/50" />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ETA</span>
              <span className="text-sm font-semibold text-foreground px-2 py-1 rounded">
                {etaDisplay}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available Seats</span>
              <span className="text-sm font-semibold text-foreground px-2 py-1 rounded">
                {orderCompleted}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Capacity</span>
              <span className="text-sm font-semibold text-foreground px-2 py-1 rounded">
                {maxLoad}
              </span>
            </div>
          </div>

          {etaData && (
            <div className="pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="text-foreground">
                    {etaData.current_speed_kmh.toFixed(1)} km/h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={cn(
                    "text-foreground",
                    etaData.is_stopped ? "text-orange-500" : "text-green-500"
                  )}>
                    {etaData.is_stopped ? "Stopped" : "Moving"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={handleMapClick} className="w-full" variant="default">
              <MapPin className="w-4 h-4 mr-2" />
              View on Map
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};