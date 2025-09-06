// utils/useAllFleets.ts
import { useEffect, useState } from "react";

export function useAllFleetCompanies() {
  const [fleets, setFleets] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/fleets/ws/all");

    ws.onopen = () => console.log("Connected to all fleets WebSocket");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received fleets data:", data);

        if (Array.isArray(data.fleets)) {
          const mapped = data.fleets.map(f => ({
            id: f.id,
            name: f.company_name,
            contactEmail: f.contact_info?.[0]?.email ?? "",
            status: f.is_active ? "active" : "inactive",
            plan: f.subscription_plan,
            vehiclesCount: f.max_vehicles?? 0,
            createdAt: f.created_at
          }));
          setFleets(mapped);
        }
      } catch (err) {
        console.error("Failed to parse fleets:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("Fleet WebSocket error:", err);
    };

    ws.onclose = () => console.log("Fleets WebSocket closed");

    return () => ws.close();
  }, []);

  return fleets;
}
