// utils/useAllFleets.ts
import { useEffect, useState } from "react";
import { wsBaseURL } from "@/utils/api";
export function useAllFleetCompanies() {
  const [fleets, setFleets] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket(`${wsBaseURL}/fleets/ws/all`);

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
            // actual vehicle count (only set if server provided it). Do NOT fall back to plan max here.
            vehiclesCount: f.vehicle_count ?? f.vehicleCount ?? undefined,
            // keep maxVehicles separately so UI can show plan limits if needed
            maxVehicles: f.max_vehicles,
            createdAt: f.created_at,
            // Approval info (may be provided by server when approved)
            approved_in: f.approved_in,
            approved_by: f.approved_by,
            role: f.role
          }));
          setFleets(mapped);
        }
      } catch (err) {
        console.error("Failed to parse fleets:", err);
      }
    };

    ws.onerror = (err) => {
      if (ws.readyState !== WebSocket.CLOSED) {
        console.error("Fleet WebSocket error:", err);
      }
    };


    ws.onclose = () => console.log("Fleets WebSocket closed");

    return () => ws.close();
  }, []);

  return fleets;
}
