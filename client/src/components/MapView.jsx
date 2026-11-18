import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

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

export const MapView = ({
  points = [],
  singlePoint = null,
  height = 'h-72',
  zoom = 13,
}) => {
  const center = singlePoint
    ? [singlePoint.latitude || 28.6139, singlePoint.longitude || 77.2090]
    : points.length > 0 && points[0].location?.latitude
    ? [points[0].location.latitude, points[0].location.longitude]
    : [28.6139, 77.2090];

  return (
    <div className={`relative w-full ${height} rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Single Marker View */}
        {singlePoint && (
          <Marker position={[singlePoint.latitude, singlePoint.longitude]}>
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <p className="font-bold text-slate-800">{singlePoint.title || 'Complaint Location'}</p>
                <p className="text-slate-600">{singlePoint.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Multi-point heatmap/cluster list */}
        {points.map((pt, idx) => {
          const lat = pt.location?.latitude;
          const lng = pt.location?.longitude;
          if (!lat || !lng) return null;

          return (
            <Marker key={pt._id || idx} position={[lat, lng]}>
              <Popup>
                <div className="p-1.5 space-y-2 text-xs min-w-44">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                    <span className="font-mono font-bold text-slate-800">{pt.complaintId}</span>
                    <PriorityBadge level={pt.priorityLevel} size="sm" />
                  </div>
                  <p className="font-medium text-slate-900 line-clamp-2">{pt.title || pt.category}</p>
                  <StatusBadge status={pt.status} size="sm" />
                  <p className="text-[11px] text-slate-500">{pt.location?.city || 'Municipal Ward'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
