import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export default function BandwidthBar({ pollMs = 5000 }) {
  const [data, setData] = useState(null);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    let alive = true;

    const fetchIt = async () => {
      try {
        const res = await api.getBandwidthAnalytics();
        if (!alive) return;
        setData(res);
        setOk(true);
      } catch (e) {
        if (!alive) return;
        setOk(false);
      }
    };

    fetchIt();
    const id = setInterval(fetchIt, pollMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [pollMs]);

  const percent = useMemo(() => {
    const raw =
      data?.savings_percent ??
      data?.savingsPercent ??
      data?.savings ??
      data?.percent ??
      null;

    if (raw == null) return null;

    const n =
      typeof raw === "number"
        ? raw
        : parseFloat(String(raw).replace("%", "").trim());

    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(100, n));
  }, [data]);

  const label = percent == null ? "—" : `${percent.toFixed(1)}%`;

  return (
    <div className="pointer-events-none absolute left-4 bottom-4 z-30 w-[360px]">
      <div className="pointer-events-auto rounded-xl border border-slate-800 bg-slate-950/70 backdrop-blur px-4 py-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
            Live Bandwidth Saved
          </div>
          <div
            className={`text-xs font-mono ${
              ok ? "text-emerald-300" : "text-yellow-300"
            }`}
            title={ok ? "Connected" : "Backend not reachable"}
          >
            {label}
          </div>
        </div>

        <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${percent ?? 0}%` }}
          />
        </div>

        <div className="mt-2 text-[11px] text-slate-500">
          {ok ? "Edge AI → metadata only" : "Waiting for /analytics/bandwidth…"}
        </div>
      </div>
    </div>
  );
}