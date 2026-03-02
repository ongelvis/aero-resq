import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { AlertPanel } from "./components/AlertPanel";
import MapArea from "./components/MapArea";
import { api } from "./api";

const SILOSO_BEACH = { lat: 1.2528, lng: 103.8096 };
// Simulated distress location near Siloso Beach
const MOCK_DISTRESS = { lat: 1.25295, lng: 103.81035 };

export default function App() {
  const [alertStatus, setAlertStatus] = useState("idle");
  // Raw backend alerts from GET /alerts/latest
  const [alerts, setAlerts] = useState([]);
  // Drone fleet from GET /drones  { DRONE_ALPHA: {...}, DRONE_BETA: {...} }
  const [drones, setDrones] = useState({});
  // alert_id returned by POST /telemetry — needed for POST /deploy-rescue
  const [lastAlertId, setLastAlertId] = useState(null);

  // Poll /alerts/latest and /drones every 3 seconds
  const poll = useCallback(async () => {
    try {
      const [latestAlerts, droneData] = await Promise.all([
        api.getLatestAlerts(),
        api.getDrones(),
      ]);
      setAlerts(latestAlerts);
      setDrones(droneData);
    } catch {
      // Backend may not be running yet — silently ignore
    }
  }, []);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [poll]);

  // POST /telemetry — simulate a distress event from a wearable/AI sensor
  const triggerAIAlert = async () => {
    try {
      const result = await api.sendTelemetry({
        device_id: `DEVICE_${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        latitude: MOCK_DISTRESS.lat,
        longitude: MOCK_DISTRESS.lng,
        distress_score: 0.94,
        status: "CRITICAL",
        privacy_mode: true,
        joint_data: null,
      });
      setLastAlertId(result.alert_id);
      setAlertStatus("detected");
      await poll(); // Immediately reflect the new alert
    } catch (e) {
      console.error("Failed to send telemetry:", e);
    }
  };

  // POST /deploy-rescue — dispatch DRONE_ALPHA to the latest alert
  const dispatchDrone = async () => {
    if (!lastAlertId) return;
    try {
      await api.deployRescue({
        alert_id: lastAlertId,
        drone_id: "DRONE_ALPHA",
        payload_type: "FLOTATION_V1",
      });
      setAlertStatus("dispatched");
      await poll(); // Reflect updated drone state
    } catch (e) {
      console.error("Failed to dispatch drone:", e);
    }
  };

  // Normalize backend alerts → shape expected by MapArea
  const incidentMarkers = alerts.map((a) => ({
    id: a.id,
    lat: a.latitude,
    lng: a.longitude,
    confidence: a.distress_score,
  }));

  // Normalize drone dict → array for MapArea
  const droneList = Object.entries(drones).map(([id, d]) => ({
    id,
    lat: d.lat,
    lng: d.lng,
    status: d.status,
    battery: d.battery,
  }));

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <Header />
      <div className="flex-1 flex flex-row overflow-hidden">
        <AlertPanel
          alertStatus={alertStatus}
          triggerAIAlert={triggerAIAlert}
          dispatchDrone={dispatchDrone}
          beachCoords={SILOSO_BEACH}
          incidents={alerts}
        />
        <MapArea droneList={droneList} incidents={incidentMarkers} />
      </div>
    </div>
  );
}