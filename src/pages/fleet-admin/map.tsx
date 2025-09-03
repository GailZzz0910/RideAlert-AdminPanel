import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

// Default center (you can change this to your preferred location)
const center = {
  lat: 8.4803, // Manila, Philippines as example
  lng: 124.6498
};

const Map: React.FC = () => {
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    // Map is loaded and ready to use
    console.log('Map loaded:', map);
    
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(userLocation);
          map.setCenter(userLocation);
          console.log('User location:', userLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const onUnmount = useCallback(() => {
    // Cleanup when map is unmounted
    console.log('Map unmounted');
  }, []);

  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {loadError && (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Error loading maps</p>
        </div>
      )}
      
      {!isLoaded && (
        <div className="flex items-center justify-center h-full">
          <p>Loading maps...</p>
        </div>
      )}
      
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Default marker at center */}
          <Marker
            position={center}
            onClick={() => handleMarkerClick({ position: center, title: 'Default Location' })}
          />

          {/* Current location marker */}
          {currentLocation && (
            <Marker
              position={currentLocation}
              onClick={() => handleMarkerClick({ position: currentLocation, title: 'Your Location' })}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          )}

          {/* Info Window for selected marker */}
          {selectedMarker && (
            <InfoWindow
              position={selectedMarker.position}
              onCloseClick={handleInfoWindowClose}
            >
              <div>
                <h3>{selectedMarker.title}</h3>
                <p>Latitude: {selectedMarker.position.lat}</p>
                <p>Longitude: {selectedMarker.position.lng}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </div>
  );
};

export default Map;