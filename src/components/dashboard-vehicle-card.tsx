import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/dashboard/maps');
  };

  return (
    <Card 
      className="group cursor-pointer relative overflow-hidden w-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-card border-border"
      onClick={handleCardClick}
    >
      {/* Hover overlay with location icon - moved outside CardContent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none z-20">
        <div className="flex flex-col items-center space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="p-3 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <p className="text-primary text-sm font-medium">View on Map</p>
        </div>
      </div>

      <CardContent className="p-0 relative group-hover:blur-sm transition-all duration-300">
        {/* Main card content */}
        <div className="p-6 space-y-4">
          {/* Header section */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground leading-tight truncate">{title}</h3>
               <p className="text-sm text-muted-foreground mt-1  truncate">Abegail Padraque</p>
             
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
                <span className="text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded">
                {subtitle}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available Seats</span>
              <span className="text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded">
                {orderCompleted}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Capacity</span>
              <span className="text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded">
                {maxLoad}
              </span>
            </div>
          </div>

          {/* Action hint */}
          <div className="pt-2 opacity-0 transition-opacity duration-300">
            <div className="text-xs text-primary/70 text-center">
              Click to view location
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
