import { useEffect, useState } from "react";
import { wsBaseURL } from "@/utils/api";
export function useFleetVehicles(fleetId: string | undefined) {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!fleetId) return;

        let ws: WebSocket | null = null;
        let closedByHook = false;

        ws = new WebSocket(`${wsBaseURL}/ws/vehicles/all/${fleetId}`);

        ws.onopen = () => console.log("Connected to fleet vehicles WebSocket");
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) setVehicles(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to parse vehicles:", err);
                setError("Failed to load vehicles");
            }
        };
        ws.onerror = (err) => {
            // only log if it wasn’t us closing
            if (!closedByHook) console.error("Vehicle WebSocket error:", err);
        };
        ws.onclose = () => console.log("Fleet vehicles WebSocket closed");

        return () => {
            closedByHook = true;
            if (ws) ws.close();
        };
    }, [fleetId]);

    return { vehicles, loading, error };
}
