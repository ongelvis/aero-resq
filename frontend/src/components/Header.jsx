import React from "react";
import { Navigation } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center px-6 justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
          <Navigation size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-wider">
          Aero-ResQ{" "}
          <span className="text-slate-500 text-sm font-normal">| COMMAND CENTER</span>
        </h1>
      </div>

      <div className="flex items-center gap-4 text-sm font-mono text-slate-400">
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> SYSTEM ONLINE
        </span>
        <span>SILOSO BEACH SECTOR</span>
      </div>
    </header>
  );
}