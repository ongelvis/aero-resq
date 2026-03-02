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

/**
 * Drone colour by status (matches backend: PATROLLING | RESCUING | IDLE)
 */
function droneColor(status) {
  if (status === "RESCUING") return "#f97316"; // orange
  if (status === "PATROLLING") return "#22d3ee"; // cyan
  return "#94a3b8"; // slate (IDLE)
}

/**
 * MapArea
 *
 * Props:
 *   droneList  — array from GET /drones, normalised: [{ id, lat, lng, status, battery }]
 *   incidents  — array from GET /alerts/latest, normalised: [{ id, lat, lng, confidence }]
 */
export default function MapArea({ droneList = [], incidents = [] }) {
  const center = [1.254, 103.8112];
  const latest = incidents[incidents.length - 1];

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
        {/* Dark base tiles */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        {/* Label overlay */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
        />

        {/* Fly to the latest distress location */}
        {latest && <FlyTo center={[latest.lat, latest.lng]} zoom={16} />}

        {/* Distress incident markers */}
        {incidents.map((inc) => (
          <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={distressIcon}>
            <Popup>
              <div style={{ fontFamily: "monospace" }}>
                <b>DISTRESS</b>
                <div>ID: {inc.id}</div>
                <div>LAT: {inc.lat}</div>
                <div>LNG: {inc.lng}</div>
                <div>CONF: {Math.round((inc.confidence ?? 0) * 100)}%</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Drone fleet — one marker per drone from GET /drones */}
        {droneList.map((drone) => {
          const color = droneColor(drone.status);
          return (
            <CircleMarker
              key={drone.id}
              center={[drone.lat, drone.lng]}
              radius={8}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.95, weight: 2 }}
            >
              <Popup>
                <div style={{ fontFamily: "monospace" }}>
                  <b>{drone.id}</b>
                  <div>STATUS: {drone.status}</div>
                  <div>BATTERY: {drone.battery}%</div>
                  <div>LAT: {drone.lat}</div>
                  <div>LNG: {drone.lng}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}