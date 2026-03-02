import React, { useEffect, useRef } from "react";
import { AlertTriangle, Crosshair, Navigation, XCircle } from "lucide-react";

export function AlertPanel({ alertStatus, triggerAIAlert, dispatchDrone, beachCoords }) {
  // prevents dispatch from firing repeatedly on re-renders
  const hasAutoDispatchedRef = useRef(false);

  useEffect(() => {
    // reset for the next incident
    if (alertStatus === "idle") {
      hasAutoDispatchedRef.current = false;
      return;
    }

    // auto-dispatch exactly once when distress is detected
    if (alertStatus === "detected" && !hasAutoDispatchedRef.current) {
      hasAutoDispatchedRef.current = true;
      dispatchDrone?.();
    }
  }, [alertStatus, dispatchDrone]);

  return (
    <div className="w-96 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4 z-10 shadow-2xl">
      <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">
        Active Incidents
      </h2>

      {alertStatus === "idle" ? (
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-lg text-slate-600">
          <Crosshair size={32} className="mb-2 opacity-50" />
          <p>No active alerts.</p>
          <button
            onClick={triggerAIAlert}
            className="mt-4 px-4 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white"
          >
            Simulate Distress
          </button>
        </div>
      ) : (
        <div
          className={`p-4 rounded-lg border ${
            alertStatus === "detected"
              ? "border-red-500 bg-red-500/10"
              : "border-orange-500 bg-orange-500/10"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertTriangle size={18} className={alertStatus === "detected" ? "animate-pulse" : ""} />
              <span>{alertStatus === "detected" ? "DISTRESS DETECTED" : "DRONE DISPATCHED"}</span>
            </div>
            <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-1 rounded">
              CONF: 94%
            </span>
          </div>

          <div className="text-sm text-slate-300 mb-4 space-y-1 font-mono">
            <p>LAT: {beachCoords.lat}</p>
            <p>LNG: {beachCoords.lng}</p>
          </div>

          {/* No human button anymore. Optional: show a status line while auto-dispatching */}
          {alertStatus === "detected" && (
            <div className="mt-2 text-xs font-mono text-orange-300">
              AUTO DISPATCHING DRONE…
            </div>
          )}

          {/* Keep dismiss if you want */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {}}
              className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex justify-center items-center transition-all"
              title="Dismiss (optional)"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}