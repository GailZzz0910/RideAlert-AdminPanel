import { useEffect, useState } from "react";

export interface VehicleData {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  available_seats: number;
  status: "available" | "full" | "unavailable";
  route: string;
  driverName: string;
  plate: string;
}

export const useVehicleWebSocket = (url: string) => {
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          setVehicles(data);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    return () => {
      socket.close();
    };
  }, [url]);

  return vehicles;
};
