import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker } from "react-leaflet";
import L from "leaflet";

function FlyTo({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.8 });
  }, [center, zoom, map]);

  return null;
}

export default function MapArea({ dronePos, incidents = [] }) {
  const center = [1.254, 103.8112];
  const latest = incidents[incidents.length - 1];

  // Pulsing distress beacon icon
  const distressIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div class="distress-beacon"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    []
  );

  return (
    <div className="flex-1 relative bg-slate-900 h-full">
      <MapContainer
        center={center}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        {/* Dark base */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        {/* Labels overlay */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
        />

        {latest && <FlyTo center={[latest.lat, latest.lng]} zoom={16} />}

        {/* Distress incidents */}
        {incidents.map((inc) => (
          <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={distressIcon}>
            <Popup>
              <div style={{ fontFamily: "monospace" }}>
                <b>DISTRESS</b>
                <div>LAT: {inc.lat}</div>
                <div>LNG: {inc.lng}</div>
                <div>CONF: {Math.round((inc.confidence ?? 0.94) * 100)}%</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Drone */}
        {dronePos && (
          <CircleMarker
            center={[dronePos.lat, dronePos.lng]}
            radius={7}
            pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.95, weight: 2 }}
          >
            <Popup>
              <div style={{ fontFamily: "monospace" }}>
                <b>DRONE</b>
                <div>LAT: {dronePos.lat}</div>
                <div>LNG: {dronePos.lng}</div>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}