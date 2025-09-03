import React, { createContext, useContext, useState, useEffect } from "react";
import { wsBaseURL } from "@/utils/api";

interface VehicleCounts {
    total: number;
    available: number;
    full: number;
    unavailable: number;
}

const VehicleContext = createContext<VehicleCounts>({
    total: 0,
    available: 0,
    full: 0,
    unavailable: 0,
});

interface VehicleProviderProps {
    children: React.ReactNode;
    fleetId: string; 
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children, fleetId }) => {
    const [counts, setCounts] = useState<VehicleCounts>({
        total: 0,
        available: 0,
        full: 0,
        unavailable: 0,
    });

    useEffect(() => {
        if (!fleetId) return; // only connect if we have a fleetId

        const ws = new WebSocket(`${wsBaseURL}/ws/vehicle-counts/${fleetId}`);

        ws.onopen = () => {
            console.log(`Connected to vehicle-counts WebSocket for fleet ${fleetId}`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setCounts({
                    total: data.total || 0,
                    available: data.available || 0,
                    full: data.full || 0,
                    unavailable: data.unavailable || 0,
                });
            } catch (err) {
                console.error("Error parsing vehicle counts:", err);
            }
        };

        ws.onclose = () => {
            console.log(`Vehicle-counts WebSocket closed for fleet ${fleetId}`);
        };

        return () => ws.close();
    }, [fleetId]); // reconnect when fleetId changes

    return (
        <VehicleContext.Provider value={counts}>
            {children}
        </VehicleContext.Provider>
    );
};

export const useVehicle = () => useContext(VehicleContext);
