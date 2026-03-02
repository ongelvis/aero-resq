import React, { useEffect, useRef } from "react";
import { AlertTriangle, Crosshair, XCircle } from "lucide-react";

/**
 * AlertPanel
 *
 * Props:
 *   alertStatus  — "idle" | "detected" | "dispatched"
 *   triggerAIAlert — calls POST /telemetry via App.jsx
 *   dispatchDrone  — calls POST /deploy-rescue via App.jsx
 *   incidents      — raw backend alerts from GET /alerts/latest
 *                    shape: [{ id, device_id, latitude, longitude, distress_score, status, timestamp }]
 */
export function AlertPanel({ alertStatus, triggerAIAlert, dispatchDrone, incidents = [] }) {
  const hasAutoDispatchedRef = useRef(false);

  useEffect(() => {
    if (alertStatus === "idle") {
      hasAutoDispatchedRef.current = false;
      return;
    }
    // Auto-dispatch exactly once when a distress event is detected
    if (alertStatus === "detected" && !hasAutoDispatchedRef.current) {
      hasAutoDispatchedRef.current = true;
      dispatchDrone?.();
    }
  }, [alertStatus, dispatchDrone]);

  // The most recent backend alert drives the panel display
  const latest = incidents[incidents.length - 1];
  const confPct = latest ? Math.round(latest.distress_score * 100) : 94;

  return (
    <div className="w-96 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4 z-10 shadow-2xl overflow-y-auto">
      <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">
        Active Incidents
      </h2>

      {alertStatus === "idle" ? (
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-lg text-slate-600">
          <Crosshair size={32} className="mb-2 opacity-50" />
          <p>No active alerts.</p>
          <button
            onClick={triggerAIAlert}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white transition-colors"
          >
            Simulate Distress
          </button>
        </div>
      ) : (
        <>
          {/* Primary alert card — uses real backend data */}
          <div
            className={`p-4 rounded-lg border ${
              alertStatus === "detected"
                ? "border-red-500 bg-red-500/10"
                : "border-orange-500 bg-orange-500/10"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertTriangle
                  size={18}
                  className={alertStatus === "detected" ? "animate-pulse" : ""}
                />
                <span>
                  {alertStatus === "detected" ? "DISTRESS DETECTED" : "DRONE DISPATCHED"}
                </span>
              </div>
              <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-1 rounded">
                CONF: {confPct}%
              </span>
            </div>

            {/* Real coords + metadata from backend */}
            <div className="text-sm text-slate-300 mb-3 space-y-1 font-mono">
              {latest ? (
                <>
                  <p>DEVICE: {latest.device_id}</p>
                  <p>LAT: {latest.latitude}</p>
                  <p>LNG: {latest.longitude}</p>
                  <p>STATUS: {latest.status}</p>
                  <p>TIME: {latest.timestamp}</p>
                  <p>PRIVACY: {latest.privacy_mode ? "SKELETAL ONLY" : "LOW-RES SNAP"}</p>
                </>
              ) : (
                <p className="text-slate-500 italic">Fetching alert data…</p>
              )}
            </div>

            {alertStatus === "detected" && (
              <div className="mt-2 text-xs font-mono text-orange-300 animate-pulse">
                AUTO DISPATCHING DRONE_ALPHA → FLOTATION_V1…
              </div>
            )}

            {alertStatus === "dispatched" && (
              <div className="mt-2 text-xs font-mono text-green-400">
                ✓ RESCUE IN PROGRESS — DRONE_ALPHA EN ROUTE
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => {}}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1 text-xs transition-colors"
                title="Dismiss"
              >
                <XCircle size={16} /> Dismiss
              </button>
            </div>
          </div>

          {/* History — all active devices from the backend */}
          {incidents.length > 1 && (
            <div className="mt-2">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">
                All Active Devices ({incidents.length})
              </h3>
              <div className="space-y-2">
                {incidents.map((a) => (
                  <div
                    key={a.id}
                    className="p-2 rounded bg-slate-800 text-xs font-mono text-slate-400 flex justify-between"
                  >
                    <span>{a.device_id}</span>
                    <span
                      className={
                        a.status === "CRITICAL"
                          ? "text-red-400"
                          : a.status === "WARNING"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}