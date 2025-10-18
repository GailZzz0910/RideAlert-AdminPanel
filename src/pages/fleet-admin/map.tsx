// import React, { useState, useEffect, useRef } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import { useLocation } from 'react-router-dom';
// import useVehicleLocationWS from '@/components/useVehicleLocationWS';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Fix for default markers in react-leaflet
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// // Custom icons
// const userIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// const vehicleIcon = new L.Icon({
//   iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// // Default center (Cagayan de Oro, Philippines)
// const center: [number, number] = [8.4803, 124.6498];

// // Component to handle map centering
// const MapController: React.FC<{
//   vehicleLocation: [number, number] | null;
//   userLocation: [number, number] | null;
// }> = ({ vehicleLocation, userLocation }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (vehicleLocation) {
//       map.flyTo(vehicleLocation, 14, {
//         duration: 1
//       });
//     }
//   }, [vehicleLocation, map]);

//   return null;
// };

// const Map: React.FC = () => {
//   const [selectedMarker, setSelectedMarker] = useState<any>(null);
//   const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
//   const [vehicleLocation, setVehicleLocation] = useState<[number, number] | null>(null);

//   // Read vehicleId from query string
//   const location = useLocation();
//   const params = new URLSearchParams(location.search);
//   const vehicleId = params.get('vehicleId');

//   // WebSocket configuration
//   const wsBaseEnv = (import.meta as any).env?.VITE_WS_BASE_URL as string | undefined;
//   const apiBaseEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
//   const defaultWsBase = wsBaseEnv || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:8000`;

//   // Use our WebSocket hook
//   const { location: liveLoc, meta, connected } = useVehicleLocationWS({ vehicleId, wsBase: defaultWsBase });

//   // Handle live location updates
//   useEffect(() => {
//     if (liveLoc) {
//       const newLoc: [number, number] = [liveLoc.latitude, liveLoc.longitude];
//       setVehicleLocation(newLoc);
//     }
//   }, [liveLoc]);

//   // Fetch initial vehicle location
//   useEffect(() => {
//     if (!vehicleId) return;

//     const apiBase = apiBaseEnv || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';

//     (async () => {
//       try {
//         const res = await fetch(`${apiBase}/vehicles/${vehicleId}`);
//         if (!res.ok) return;
//         const data = await res.json();
//         const loc = data?.location;
//         if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
//           const initial: [number, number] = [loc.latitude, loc.longitude];
//           setVehicleLocation(initial);
//         }
//       } catch (e) {
//         console.error('Failed to fetch initial vehicle location', e);
//       }
//     })();
//   }, [vehicleId]);

//   // Get user's current location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const uLoc: [number, number] = [
//             position.coords.latitude,
//             position.coords.longitude
//           ];
//           setUserLocation(uLoc);
//           console.log('User location:', uLoc);
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//         }
//       );
//     }
//   }, []);

//   const handleMarkerClick = (marker: any) => {
//     setSelectedMarker(marker);
//   };

//   const handlePopupClose = () => {
//     setSelectedMarker(null);
//   };

//   return (
//     // Reserve space for fixed header (64px) so map controls and status aren't hidden underneath
//     <div style={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative', zIndex: 0 }}>

//       <MapContainer
//         {...({ center: center as any, zoom: 13, style: { height: '100%', width: '100%', zIndex: 0 }, whenCreated: (map: any) => {
//           try {
//             // Move default zoom control to top-right so it doesn't overlap the header
//             map?.zoomControl?.setPosition && map.zoomControl.setPosition('topright');
//           } catch (e) {
//             // ignore
//           }
//         } } as any)}
//       >
//         <MapController
//           vehicleLocation={vehicleLocation}
//           userLocation={userLocation}
//         />

//         {/* OpenStreetMap tiles (free) */}
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {/* User location marker */}
//         {userLocation && (
//           <Marker {...({ position: userLocation, icon: userIcon, eventHandlers: { click: () => handleMarkerClick({ position: userLocation, title: 'Your Location' }) } } as any)}>
//             <Popup {...({ onClose: handlePopupClose } as any)}>
//               <div>
//                 <h3 className="font-bold">Your Location</h3>
//               </div>
//             </Popup>
//           </Marker>
//         )}

//         {/* Vehicle location marker */}
//         {vehicleLocation && (
//           <Marker {...({ position: vehicleLocation, icon: vehicleIcon, eventHandlers: { click: () => handleMarkerClick({ position: vehicleLocation, title: meta?.vehicleId ? `Vehicle ${meta.vehicleId}` : `Device ${meta?.deviceId ?? ''}` }) } } as any)}>
//             <Popup {...({ onClose: handlePopupClose } as any)}>
//               <div>
//                 <h3 className="font-bold">
//                   {meta?.vehicleId ? `Vehicle ${meta.vehicleId}` : `Device ${meta?.deviceId ?? ''}`}
//                 </h3>
//               </div>
//             </Popup>
//           </Marker>
//         )}
//       </MapContainer>
//     </div>
//   );
// };

// export default Map;

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import useVehicleLocationWS from '@/components/useVehicleLocationWS';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const vehicleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Default center (Cagayan de Oro, Philippines)
const center: [number, number] = [8.4803, 124.6498];

interface VehicleData {
  id: string;
  route: string;
  driverName: string;
  status: string;
  available_seats: number;
  plate: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

const Map: React.FC = () => {
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [vehicleLocation, setVehicleLocation] = useState<[number, number] | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  // Read vehicleId from query string
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const vehicleId = params.get('vehicleId');

  // WebSocket configuration
  const wsBaseEnv = (import.meta as any).env?.VITE_WS_BASE_URL as string | undefined;
  const apiBaseEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const defaultWsBase = wsBaseEnv || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:8000`;

  // Use our WebSocket hook
  const { location: liveLoc, meta, connected } = useVehicleLocationWS({ vehicleId, wsBase: defaultWsBase });

  // Handle live location updates
  useEffect(() => {
    if (liveLoc) {
      const newLoc: [number, number] = [liveLoc.latitude, liveLoc.longitude];
      setVehicleLocation(newLoc);
    }
  }, [liveLoc]);

  // Fetch initial vehicle data
  useEffect(() => {
    if (!vehicleId) return;

    const apiBase = apiBaseEnv || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';

    (async () => {
      try {
        const res = await fetch(`${apiBase}/vehicles/${vehicleId}`);
        if (!res.ok) return;
        const data = await res.json();
        
        setVehicleData(data);
        
        const loc = data?.location;
        if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
          const initial: [number, number] = [loc.latitude, loc.longitude];
          setVehicleLocation(initial);
        }
      } catch (e) {
        console.error('Failed to fetch initial vehicle data', e);
      }
    })();
  }, [vehicleId]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLoc: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setUserLocation(uLoc);
          console.log('User location:', uLoc);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Helper functions
  const getVehicleStatusFromData = (status: string | null | undefined): string => {
    if (!status) return 'Unknown';
    const normalizedStatus = String(status).toLowerCase().trim();
    switch (normalizedStatus) {
      case 'available':
        return 'Available';
      case 'full':
        return 'Full';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  const getStatusColorFromData = (status: string | null | undefined): string => {
    if (!status) return 'bg-gray-500';
    const normalizedStatus = String(status).toLowerCase().trim();
    switch (normalizedStatus) {
      case 'available':
        return 'bg-green-500';
      case 'full':
        return 'bg-orange-500';
      case 'unavailable':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker);
  };

  const handlePopupClose = () => {
    setSelectedMarker(null);
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative', zIndex: 0 }}>
      <MapContainer
        {...({ 
          center: center as any, 
          zoom: 13, 
          style: { height: '100%', width: '100%', zIndex: 0 }, 
          whenCreated: (map: any) => {
            try {
              map?.zoomControl?.setPosition && map.zoomControl.setPosition('topright');
            } catch (e) {
              // ignore
            }
          } 
        } as any)}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User location marker */}
        {userLocation && (
          <Marker 
            {...({ 
              position: userLocation, 
              icon: userIcon, 
              eventHandlers: { 
                click: () => handleMarkerClick({ position: userLocation, title: 'Your Location' }) 
              } 
            } as any)}
          >
            <Popup {...({ onClose: handlePopupClose } as any)}>
              <div className="p-2">
                <h3 className="font-bold text-sm">Your Location</h3>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vehicle location marker */}
        {vehicleLocation && (
          <Marker 
            {...({ 
              position: vehicleLocation, 
              icon: vehicleIcon, 
              eventHandlers: { 
                click: () => handleMarkerClick({ 
                  position: vehicleLocation, 
                  title: vehicleData?.route || 'Vehicle' 
                }) 
              } 
            } as any)}
          >
            <Popup {...({ onClose: handlePopupClose } as any)}>
              <div className="p-2">
                <h3 className="font-bold">{vehicleData?.route || 'Vehicle'}</h3>
                <p className="text-sm">Driver: {vehicleData?.driverName || 'N/A'}</p>
                <p className="text-sm">
                  Status: 
                  <span className={`ml-1 px-2 py-0.5 rounded text-white text-xs font-medium ${getStatusColorFromData(vehicleData?.status || '')}`}>
                    {getVehicleStatusFromData(vehicleData?.status || '')}
                  </span>
                </p>
                <p className="text-sm">Available Seats: {vehicleData?.available_seats || 0}</p>
                <p className="text-sm">Plate: {vehicleData?.plate || 'N/A'}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;