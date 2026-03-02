import React, { useState } from "react";
import { Header } from "./components/Header";
import { AlertPanel } from "./components/AlertPanel";
import MapArea from "./components/MapArea";

const SILOSO_BEACH = { lat: 1.2528, lng: 103.8096 };
const MOCK_DISTRESS = { lat: 1.25295, lng: 103.81035 };

export default function App() {
  const [alertStatus, setAlertStatus] = useState("idle");
  const [dronePos, setDronePos] = useState({ lat: 1.254, lng: 103.8112 });
  const [incidents, setIncidents] = useState([]);

  const triggerAIAlert = () => {
    setAlertStatus("detected");
    setIncidents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        lat: MOCK_DISTRESS.lat,
        lng: MOCK_DISTRESS.lng,
        confidence: 0.94,
        createdAt: Date.now(),
      },
    ]);
  };

  const dispatchDrone = () => {
    setAlertStatus("dispatched");
    const latest = incidents[incidents.length - 1];
    if (latest) setDronePos({ lat: latest.lat, lng: latest.lng });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <Header />
      <div className="flex-1 flex flex-row overflow-hidden">
        <AlertPanel
          alertStatus={alertStatus}
          triggerAIAlert={triggerAIAlert}
          dispatchDrone={dispatchDrone}
          beachCoords={SILOSO_BEACH}
        />
        <MapArea dronePos={dronePos} incidents={incidents} />
      </div>
    </div>
  );
}