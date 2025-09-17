import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

export interface DashboardVehicleCardProps {
  // img: string; // Removed image prop
  title: string;
  subtitle: string;
  status: string;
  statusColor: string;
  orderCompleted: number;
  lastCheckIn: string;
  lastCheckInAgo: string;
  maxLoad: string;
  driver: string;
  className?: string;
}

export const DashboardVehicleCard: React.FC<DashboardVehicleCardProps> = ({
  title,
  subtitle,
  status,
  statusColor,
  orderCompleted,
  maxLoad,
  driver
}) => {
  const navigate = useNavigate();

  const handleMapClick = () => {
    navigate('/dashboard/maps');
  };

  return (
    <Card className="w-full bg-card border-border">
      <CardContent className="p-0">
        {/* Main card content */}
        <div className="p-4 space-y-3">
          {/* Header section */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground leading-tight truncate">{title}</h3>
               <p className="text-sm text-muted-foreground mt-1  truncate">{driver}</p>
             
            </div>
            <span className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap border",
              statusColor
            )}>
              {status}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Details section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ETA</span>
                <span className="text-sm font-semibold text-foreground  px-2 py-1 rounded">
                {subtitle}
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
              <span className="text-sm font-semibold text-foreground  px-2 py-1 rounded">
                {maxLoad}
              </span>
            </div>
          </div>

          {/* View on Map Button */}
          <div className="pt-2">
            <Button 
              onClick={handleMapClick}
              className="w-full cursor-pointer"
              variant="default"
            >
              <MapPin className="w-4 h-4 mr-2" />
              View on Map
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
