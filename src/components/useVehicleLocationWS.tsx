import { useEffect, useRef, useState } from "react";

export interface LocationUpdate {
  type: string;
  timestamp?: string;
  vehicle_id?: string | null;
  device_id?: string;
  latitude?: number;
  longitude?: number;
}

interface UseVehicleLocationOptions {
  vehicleId?: string | null;
  deviceId?: string | null;
  wsBase?: string; // e.g. ws://localhost:8000
}

export const useVehicleLocationWS = ({ vehicleId, deviceId, wsBase }: UseVehicleLocationOptions) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [meta, setMeta] = useState<{ vehicleId?: string | null; deviceId?: string | null } | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Build WS base URL
    let base = wsBase;
    if (!base) {
      // derive from current location
      const loc = window.location;
      const proto = loc.protocol === "https:" ? "wss:" : "ws:";
      base = `${proto}//${loc.host}`;
    }

    // Prefer vehicle subscription if vehicleId provided, otherwise device subscription
    const tryUrls: string[] = [];
    if (vehicleId) tryUrls.push(`${base}/ws/vehicle/${vehicleId}/location`);
    if (deviceId) tryUrls.push(`${base}/ws/device/${deviceId}/location`);
    // fallback to generic all vehicles stream
    tryUrls.push(`${base}/ws/vehicles/locations`);

    let closed = false;

    const connectTo = (url: string) => {
      if (closed) return;
      try {
        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
          setConnected(true);
          // If this is vehicle-specific endpoint, send initial payload for tracking if needed
          if (url.includes("/ws/track-vehicle") || url.includes("/ws/vehicle/")) {
            // Some endpoints expect a JSON body with vehicle_id; but our endpoints accept path param so no payload required
          }
        };

        ws.onmessage = (ev) => {
          try {
            const data: LocationUpdate = JSON.parse(ev.data);
            if (Array.isArray(data)) return; // ignore array messages

            // Accept message shapes with latitude & longitude
            if (typeof data.latitude === "number" && typeof data.longitude === "number") {
              setLocation({ latitude: data.latitude, longitude: data.longitude });
              setMeta({ vehicleId: data.vehicle_id ?? null, deviceId: data.device_id ?? null });
            }
          } catch (err) {
            console.error("useVehicleLocationWS: failed to parse message", err);
          }
        };

        ws.onclose = () => {
          setConnected(false);
          // try next URL if available
          const idx = tryUrls.indexOf(url);
          if (idx >= 0 && idx < tryUrls.length - 1) {
            connectTo(tryUrls[idx + 1]);
          }
        };

        ws.onerror = (e) => {
          console.warn("WebSocket error connecting to", url, e);
          ws.close();
        };
      } catch (e) {
        console.warn("WebSocket connect failed", e);
      }
    };

    // Start with first URL
    if (tryUrls.length > 0) connectTo(tryUrls[0]);

    return () => {
      closed = true;
      setConnected(false);
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [vehicleId, deviceId, wsBase]);

  return { location, meta, connected } as const;
};

export default useVehicleLocationWS;
