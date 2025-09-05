import { useState, useEffect } from "react";

export const useAllFleets = () => {
  const [fleets, setFleets] = useState<any[]>([]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isMounted = true;

    if (!ws) {
      ws = new WebSocket("ws://localhost:8000/fleets/ws/all");

      ws.onopen = () => {
        if (isMounted) console.log("Connected to all fleets WebSocket");
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          console.log("Received fleets data:", data); // Debug log
          // Handle both array and {fleets: [...]} formats
          const fleetsData = Array.isArray(data) ? data : data.fleets || [];
          setFleets(fleetsData);
        } catch (err) {
          console.error("Error parsing WebSocket message", err);
        }
      };

      ws.onerror = (err) => {
        if (isMounted) console.error("WebSocket error", err);
      };

      ws.onclose = () => {
        if (isMounted) console.log("All fleets WebSocket disconnected");
      };
    }

    return () => {
      isMounted = false;
      ws?.close();
    };
  }, []);

  return fleets;
};