'use client';
import { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

export function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const defaultPosition = { lat: 34.0522, lng: -118.2437 }; // Default to LA, should be user's campus
  const [position, setPosition] = useState(defaultPosition);

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          reverseGeocode(newPos.lat, newPos.lng);
        },
        () => {
          // If user denies, just use default and geocode that
          reverseGeocode(defaultPosition.lat, defaultPosition.lng);
        }
      );
    } else {
        reverseGeocode(defaultPosition.lat, defaultPosition.lng);
    }
  }, []);

  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        onLocationChange(lat, lng, results[0].formatted_address);
      } else {
        onLocationChange(lat, lng, 'Unknown address');
      }
    });
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      setPosition(newPos);
      reverseGeocode(newPos.lat, newPos.lng);
    }
  };

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border">
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={position}
        center={position}
        defaultZoom={15}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
        onClick={handleMapClick}
      >
        <AdvancedMarker position={position}>
          <Pin />
        </AdvancedMarker>
      </Map>
    </div>
  );
}
