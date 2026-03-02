import React from "react";
import { AlertTriangle, Crosshair } from "lucide-react";

export function AlertPanel({
  alertStatus,
  triggerAIAlert,
  distresses = [],
  incidentLog = [],
}) {
  const latest = distresses.length ? distresses[distresses.length - 1] : null;

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString("en-SG", { hour12: false });

  return (
    <div className="w-96 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4 z-10 shadow-2xl overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold">
          Active Incidents
        </h2>

        {/* ✅ ALWAYS AVAILABLE */}
        <button
          onClick={triggerAIAlert}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white transition-colors"
          title="Create a test distress"
        >
          Simulate Distress
        </button>
      </div>

      {/* STATUS CARD */}
      <div
        className={`p-4 rounded-lg border ${
          alertStatus === "detected"
            ? "border-red-500 bg-red-500/10"
            : alertStatus === "dispatched"
            ? "border-orange-500 bg-orange-500/10"
            : "border-slate-800 bg-slate-900/40"
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle
              size={18}
              className={alertStatus === "detected" ? "animate-pulse" : ""}
            />
            <span>
              {alertStatus === "detected"
                ? "DISTRESS DETECTED"
                : alertStatus === "dispatched"
                ? "DRONE DISPATCHED"
                : "SYSTEM IDLE"}
            </span>
          </div>

          {latest && (
            <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-1 rounded">
              CONF: {Math.round((latest.confidence ?? 0) * 100)}%
            </span>
          )}
        </div>

        {distresses.length === 0 ? (
          <div className="text-xs text-slate-500 italic">Waiting for incidents…</div>
        ) : (
          <>
            {alertStatus === "detected" && (
              <div className="mt-2 text-xs font-mono text-orange-300 animate-pulse">
                AUTO DEPLOYING DRONE_ALPHA → FLOTATION_V1…
              </div>
            )}
            {alertStatus === "dispatched" && (
              <div className="mt-2 text-xs font-mono text-green-400">
                ✓ RESCUE IN PROGRESS — DRONE_ALPHA EN ROUTE
              </div>
            )}
          </>
        )}
      </div>

      {/* CURRENT DISTRESSES */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-3 py-2 text-[11px] font-mono text-slate-400 bg-slate-900/60 border-b border-slate-800 flex justify-between">
          <span>CURRENT DISTRESSES</span>
          <span>({distresses.length})</span>
        </div>

        <div className="max-h-60 overflow-auto">
          {distresses.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-500">No active distresses.</div>
          ) : (
            distresses
              .slice()
              .reverse()
              .map((d) => (
                <div
                  key={d.id}
                  className="px-3 py-2 border-b border-slate-800 text-xs font-mono"
                >
                  <div className="flex justify-between">
                    <span className="text-red-300">{d.device_id || "UNKNOWN_DEVICE"}</span>
                    <span className="text-slate-500">{d.timestamp || ""}</span>
                  </div>
                  <div className="text-slate-400 mt-1">
                    LAT: {d.lat} &nbsp; LNG: {d.lng}
                  </div>
                  <div className="text-slate-500 mt-1 flex gap-3 flex-wrap">
                    <span>CONF: {Math.round((d.confidence ?? 0) * 100)}%</span>
                    <span>STATUS: {d.status}</span>
                    <span>ID: {d.id}</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* INCIDENT LOG */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-3 py-2 text-[11px] font-mono text-slate-400 bg-slate-900/60 border-b border-slate-800 flex justify-between">
          <span>INCIDENT LOG</span>
          <span>({incidentLog.length})</span>
        </div>

        <div className="max-h-64 overflow-auto">
          {incidentLog.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-500">No log entries yet.</div>
          ) : (
            incidentLog.map((e) => (
              <div
                key={e.id}
                className="px-3 py-2 border-b border-slate-800 text-xs font-mono"
              >
                <div className="flex justify-between">
                  <span className="text-slate-500">{formatTime(e.ts)}</span>
                  <span
                    className={
                      e.type === "DETECTED"
                        ? "text-red-300"
                        : e.type === "DISPATCHED"
                        ? "text-orange-200"
                        : e.type === "ERROR"
                        ? "text-yellow-300"
                        : "text-slate-300"
                    }
                  >
                    {e.type}
                  </span>
                </div>
                <div className="mt-1 text-slate-300">{e.label}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}