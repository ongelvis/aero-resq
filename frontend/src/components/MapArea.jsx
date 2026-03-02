import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Popup, useMap, Marker } from "react-leaflet";
import L from "leaflet";

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

/**
 * MapArea
 * Props:
 *   incidents — [{ id, lat, lng, confidence }]
 * Only renders red distress signals.
 */
export default function MapArea({ incidents = [] }) {
  const center = [1.254, 103.8112];

  // sanitize incidents: ensure lat/lng are real numbers
  const safeIncidents = useMemo(() => {
    return (incidents || [])
      .map((inc) => {
        const lat = Number(inc.lat);
        const lng = Number(inc.lng);
        return { ...inc, lat, lng };
      })
      .filter(
        (inc) =>
          inc.id != null &&
          Number.isFinite(inc.lat) &&
          Number.isFinite(inc.lng) &&
          Math.abs(inc.lat) <= 90 &&
          Math.abs(inc.lng) <= 180
      );
  }, [incidents]);

  const latest = safeIncidents[safeIncidents.length - 1];

  // red distress icon (visible even if CSS fails)
  const distressIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div
            class="distress-beacon"
            style="
              width:14px;height:14px;border-radius:9999px;
              background:#ef4444;
              box-shadow:0 0 14px rgba(239,68,68,0.75);
              border:1px solid rgba(255,255,255,0.15);
            "
          ></div>
        `,
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
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
        />

        {/* Fly to latest distress */}
        {latest && <FlyTo center={[latest.lat, latest.lng]} zoom={16} />}

        {/* Red distress markers only */}
        {safeIncidents.map((inc) => (
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
      </MapContainer>
    </div>
  );
}