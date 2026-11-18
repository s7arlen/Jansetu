import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Fix for leaflet default marker icons in Vite
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition, onLocationChange }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      if (onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position ? <Marker position={position} /> : null;
}

export const MapPicker = ({
  initialLat = 28.6139,
  initialLng = 77.2090,
  onLocationSelect,
}) => {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([parseFloat(initialLat), parseFloat(initialLng)]);
    }
  }, [initialLat, initialLng]);

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          if (onLocationSelect) {
            onLocationSelect(pos.coords.latitude, pos.coords.longitude);
          }
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err);
        }
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          Click anywhere on the map to pin exact site:
        </span>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
        >
          <Navigation className="w-3 h-3" />
          Use My Current GPS
        </button>
      </div>

      <div className="relative h-60 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner z-0">
        {!mapError ? (
          <MapContainer
            center={position}
            zoom={14}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              setPosition={setPosition}
              onLocationChange={onLocationSelect}
            />
          </MapContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-slate-100 text-slate-500 p-4 text-center">
            <MapPin className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm font-medium">Interactive map temporarily offline</p>
            <p className="text-xs">Location coordinates can still be manually entered</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
        <span>Latitude: {Number(position[0]).toFixed(5)}</span>
        <span>Longitude: {Number(position[1]).toFixed(5)}</span>
      </div>
    </div>
  );
};
