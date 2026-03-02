import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Header } from "./components/Header";
import { AlertPanel } from "./components/AlertPanel";
import MapArea from "./components/MapArea";
import BandwidthBar from "./components/BandwidthBar"; // ✅ NEW
import { api } from "./api";

const SILOSO_BEACH = { lat: 1.2528, lng: 103.8096 };
const MOCK_DISTRESS = { lat: 1.25295, lng: 103.81035 };
const DISTRESS_THRESHOLD = 0.8;

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [alertStatus, setAlertStatus] = useState("idle"); // idle | detected | dispatched

  // ✅ Incident log
  const [incidentLog, setIncidentLog] = useState([]);

  // Avoid duplicate DETECTED log lines for same alert
  const seenAlertIdsRef = useRef(new Set());

  // Avoid deploying multiple times for the same alert id
  const deployedForAlertRef = useRef(new Set());

  const addLog = useCallback((entry) => {
    const id =
      (crypto?.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setIncidentLog((prev) =>
      [
        {
          id,
          ts: Date.now(),
          ...entry,
        },
        ...prev,
      ].slice(0, 50)
    );
  }, []);

  const getAlertId = (a) => a?.id ?? a?.alert_id ?? a?.alertId ?? a?.alertID ?? null;
  const getLat = (a) => Number(a?.latitude ?? a?.lat);
  const getLng = (a) => Number(a?.longitude ?? a?.lng);
  const getConf = (a) => Number(a?.distress_score ?? a?.confidence ?? 0);

  const isDistress = (a) => {
    const conf = getConf(a);
    return a?.status === "CRITICAL" || conf >= DISTRESS_THRESHOLD;
  };

  // Poll /alerts/latest every 3 seconds
  const poll = useCallback(async () => {
    try {
      const latestAlertsRaw = await api.getLatestAlerts();
      const latestAlerts = Array.isArray(latestAlertsRaw) ? latestAlertsRaw : [];
      setAlerts(latestAlerts);

      // Log NEW distresses once
      for (const a of latestAlerts) {
        if (!isDistress(a)) continue;

        const alertId = getAlertId(a);
        if (!alertId) continue;

        if (!seenAlertIdsRef.current.has(alertId)) {
          seenAlertIdsRef.current.add(alertId);

          addLog({
            type: "DETECTED",
            label: "DISTRESS DETECTED",
            alert_id: alertId,
            coords: { lat: getLat(a), lng: getLng(a) },
            conf: getConf(a),
            source: "backend",
          });
        }
      }
    } catch (e) {
      console.warn("Poll failed (backend down / API error):", e);
      addLog({
        type: "ERROR",
        label: "POLL FAILED (BACKEND DOWN / API ERROR)",
        source: "poll",
      });
    }
  }, [addLog]);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [poll]);

  // Normalize ONLY distresses for UI
  const distresses = useMemo(() => {
    return (alerts || [])
      .filter(isDistress)
      .map((a) => ({
        id: getAlertId(a),
        device_id: a.device_id,
        lat: getLat(a),
        lng: getLng(a),
        confidence: getConf(a),
        status: a.status,
        timestamp: a.timestamp,
        privacy_mode: a.privacy_mode,
      }))
      .filter(
        (d) =>
          d.id != null &&
          Number.isFinite(d.lat) &&
          Number.isFinite(d.lng) &&
          Math.abs(d.lat) <= 90 &&
          Math.abs(d.lng) <= 180
      );
  }, [alerts]);

  const latestDistress = distresses.length ? distresses[distresses.length - 1] : null;

  // Auto deploy drone when distresses exist (once per alert id)
  const deployRescueForAlert = useCallback(
    async (alertId) => {
      if (!alertId) return;
      if (deployedForAlertRef.current.has(alertId)) return;

      try {
        await api.deployRescue({
          alert_id: alertId,
          drone_id: "DRONE_ALPHA",
          payload_type: "FLOTATION_V1",
        });

        deployedForAlertRef.current.add(alertId);
        setAlertStatus("dispatched");

        addLog({
          type: "DISPATCHED",
          label: "DRONE AUTO-DEPLOYED",
          alert_id: alertId,
          drone_id: "DRONE_ALPHA",
          source: "backend",
        });

        await poll();
      } catch (e) {
        console.error("Failed to auto-deploy drone:", e);
        addLog({
          type: "ERROR",
          label: "AUTO-DEPLOY FAILED",
          alert_id: alertId,
          drone_id: "DRONE_ALPHA",
          source: "deploy",
        });
      }
    },
    [poll, addLog]
  );

  // Drive status based on whether there is a distress + whether we've deployed for it
  useEffect(() => {
    if (!latestDistress) {
      setAlertStatus("idle");
      return;
    }

    const id = latestDistress.id;
    if (deployedForAlertRef.current.has(id)) setAlertStatus("dispatched");
    else setAlertStatus("detected");
  }, [latestDistress]);

  // Actually trigger auto-deploy when detected
  useEffect(() => {
    if (!latestDistress) return;
    const id = latestDistress.id;
    if (!id) return;

    if (!deployedForAlertRef.current.has(id)) {
      deployRescueForAlert(id);
    }
  }, [latestDistress, deployRescueForAlert]);

  // Keep simulate button for testing
  const triggerAIAlert = async () => {
    try {
      const deviceId =
        (crypto?.randomUUID && crypto.randomUUID().slice(0, 8).toUpperCase()) ||
        Math.random().toString(16).slice(2, 10).toUpperCase();

      await api.sendTelemetry({
        device_id: `DEVICE_${deviceId}`,
        latitude: MOCK_DISTRESS.lat,
        longitude: MOCK_DISTRESS.lng,
        distress_score: 0.94,
        status: "CRITICAL",
        privacy_mode: true,
        joint_data: null,
      });

      addLog({
        type: "SIM",
        label: "SIMULATED DISTRESS SENT",
        coords: { lat: MOCK_DISTRESS.lat, lng: MOCK_DISTRESS.lng },
        conf: 0.94,
        source: "telemetry",
      });

      await poll();
    } catch (e) {
      console.error("Failed to send telemetry:", e);
      addLog({
        type: "ERROR",
        label: "SIMULATE DISTRESS FAILED",
        source: "telemetry",
      });
    }
  };

  // Map markers: ONLY red distress signals
  const distressMarkers = distresses.map((d) => ({
    id: d.id,
    lat: d.lat,
    lng: d.lng,
    confidence: d.confidence,
  }));

  return (
    // ✅ Make root relative so BandwidthBar absolute positioning works
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100 font-sans overflow-hidden relative">
      <Header />
      <div className="flex-1 flex flex-row overflow-hidden">
        <AlertPanel
          alertStatus={alertStatus}
          triggerAIAlert={triggerAIAlert}
          distresses={distresses}
          incidentLog={incidentLog}
          beachCoords={SILOSO_BEACH}
        />
        <MapArea incidents={distressMarkers} />
      </div>

      {/* ✅ NEW: bottom-left bandwidth savings bar */}
      <BandwidthBar pollMs={5000} />
    </div>
  );
}