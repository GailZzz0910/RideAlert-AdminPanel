import { useState, useEffect } from "react";
import { wsBaseURL } from "@/utils/api";
export const useVehicleCounter = () => {
  const [vehicleCount, setVehicleCount] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    // Prevent duplicate connections in Strict Mode
    if (!ws) {
      ws = new WebSocket(`${wsBaseURL}/vehicles/ws/count-vehicles`);

      ws.onopen = () => {
        if (isMounted) console.log("Connected to vehicle count WebSocket");
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.total_vehicles !== undefined) {
            setVehicleCount(data.total_vehicles);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message", err);
        }
      };

      ws.onerror = (err) => {
        if (isMounted) console.error("WebSocket error", err);
      };

      ws.onclose = () => {
        if (isMounted) console.log("Vehicle count WebSocket disconnected");
      };
    }

    return () => {
      isMounted = false;
      ws?.close();
    };
  }, []);

  return vehicleCount;
};
