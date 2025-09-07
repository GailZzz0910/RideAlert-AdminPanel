import { useEffect, useState } from "react";
import { wsBaseURL } from "@/utils/api";
export const useFleetCounter = () => {

const [fleetCount, setFleetCount] = useState(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    // Prevent duplicate connections in Strict Mode
    if (!ws) {
      ws = new WebSocket(`${wsBaseURL}/fleets/ws/count-fleets`);

      ws.onopen = () => {
        if (isMounted) console.log("Connected to fleet count WebSocket");
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.total_fleets !== undefined) {
            setFleetCount(data.total_fleets);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message", err);
        }
      };

      ws.onerror = (err) => {
        if (isMounted) console.error("WebSocket error", err);
      };

      ws.onclose = () => {
        if (isMounted) console.log("Fleet count WebSocket disconnected");
      };
    }

    return () => {
      isMounted = false;
      ws?.close();
    };
  }, []);

  return fleetCount;
};