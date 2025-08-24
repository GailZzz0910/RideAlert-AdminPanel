import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/utils/api";

interface VehicleContextProps {
  vehicleCount: number;
}

const VehicleContext = createContext<VehicleContextProps>({ vehicleCount: 0 });

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicleCount, setVehicleCount] = useState(0);

  const fetchVehicleCount = async () => {
    try {
      const res = await api.get("/vehicles/count");
      setVehicleCount(res.data.count);
    } catch (error) {
      console.error("Error fetching vehicle count:", error);
    }
  };

  useEffect(() => {
    fetchVehicleCount();
    const interval = setInterval(fetchVehicleCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <VehicleContext.Provider value={{ vehicleCount }}>
      {children}
    </VehicleContext.Provider>
  );
};

// ✅ custom hook
export const useVehicle = () => {
  return useContext(VehicleContext);
};
