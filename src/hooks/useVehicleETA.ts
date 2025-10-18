import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/userContext';

interface ETAData {
  eta_formatted: string;
  distance_km: number;
  current_speed_kmh: number;
  average_speed_kmh: number;
  is_stopped: boolean;
  confidence: string;
  message: string;
}

interface UseVehicleETAProps {
  vehicleId: string;
  userLocation: { latitude: number; longitude: number } | null;
}

// Configure your backend URL here
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const useVehicleETA = ({ vehicleId, userLocation }: UseVehicleETAProps) => {
  const { token } = useUser();
  const [etaData, setEtaData] = useState<ETAData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateETA = async () => {
    if (!userLocation || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/vehicles/calculate-eta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicle_id: vehicleId,
          user_location: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setEtaData({
        eta_formatted: data.eta_formatted,
        distance_km: data.distance_km,
        current_speed_kmh: data.current_speed_kmh,
        average_speed_kmh: data.average_speed_kmh,
        is_stopped: data.is_stopped,
        confidence: data.confidence,
        message: data.message,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate ETA');
      console.error('ETA calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectToWebSocket = () => {
    if (!token || !vehicleId) return;

    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = import.meta.env.VITE_WS_HOST || 'localhost:8000';
      const wsUrl = `${wsProtocol}//${wsHost}/vehicles/ws/eta/${vehicleId}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`Connected to ETA WebSocket for vehicle ${vehicleId}`);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'eta_update' || message.data) {
            const data = message.data || message;
            setEtaData({
              eta_formatted: data.eta_formatted || 'N/A',
              distance_km: data.distance_km || 0,
              current_speed_kmh: data.current_speed_kmh || 0,
              average_speed_kmh: data.average_speed_kmh || 0,
              is_stopped: data.is_stopped || false,
              confidence: data.confidence || 'low',
              message: data.message || '',
            });
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('ETA WebSocket error:', err);
        setError('Real-time updates unavailable');
      };

      wsRef.current.onclose = () => {
        console.log(`Disconnected from ETA WebSocket for vehicle ${vehicleId}`);
      };
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
    }
  };

  useEffect(() => {
    if (!userLocation || !vehicleId) return;

    calculateETA();
    connectToWebSocket();

    updateIntervalRef.current = setInterval(() => {
      calculateETA();
    }, 10000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [vehicleId, userLocation, token]);

  return {
    etaData,
    loading,
    error,
    refetch: calculateETA,
  };
};