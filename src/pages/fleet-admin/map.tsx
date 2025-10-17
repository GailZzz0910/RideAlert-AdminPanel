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

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

const Map: React.FC = () => {
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [vehicleLocation, setVehicleLocation] = useState<[number, number] | null>(null);

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

  // Fetch initial vehicle location
  useEffect(() => {
    if (!vehicleId) return;

    const apiBase = apiBaseEnv || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8000';

    (async () => {
      try {
        const res = await fetch(`${apiBase}/vehicles/${vehicleId}`);
        if (!res.ok) return;
        const data = await res.json();
        const loc = data?.location;
        if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
          const initial: [number, number] = [loc.latitude, loc.longitude];
          setVehicleLocation(initial);
        }
      } catch (e) {
        console.error('Failed to fetch initial vehicle location', e);
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

  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker);
  };

  const handlePopupClose = () => {
    setSelectedMarker(null);
  };

  return (
    // Reserve space for fixed header (64px) so map controls and status aren't hidden underneath
    <div style={{ height: 'calc(100vh - 64px)', width: '100%', position: 'relative', zIndex: 0 }}>

      <MapContainer
        {...({ center: center as any, zoom: 13, style: { height: '100%', width: '100%', zIndex: 0 }, whenCreated: (map: any) => {
          try {
            // Move default zoom control to top-right so it doesn't overlap the header
            map?.zoomControl?.setPosition && map.zoomControl.setPosition('topright');
          } catch (e) {
            // ignore
          }
        } } as any)}
      >
        {/* REMOVED: MapController component that was causing auto-panning */}

        {/* OpenStreetMap tiles (free) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker {...({ position: userLocation, icon: userIcon, eventHandlers: { click: () => handleMarkerClick({ position: userLocation, title: 'Your Location' }) } } as any)}>
            <Popup {...({ onClose: handlePopupClose } as any)}>
              <div>
                <h3 className="font-bold">Your Location</h3>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vehicle location marker */}
        {vehicleLocation && (
          <Marker {...({ position: vehicleLocation, icon: vehicleIcon, eventHandlers: { click: () => handleMarkerClick({ position: vehicleLocation, title: meta?.vehicleId ? `Vehicle ${meta.vehicleId}` : `Device ${meta?.deviceId ?? ''}` }) } } as any)}>
            <Popup {...({ onClose: handlePopupClose } as any)}>
              <div>
                <h3 className="font-bold">
                  {meta?.vehicleId ? `Vehicle ${meta.vehicleId}` : `Device ${meta?.deviceId ?? ''}`}
                </h3>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default Map;