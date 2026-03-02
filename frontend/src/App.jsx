import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { ShieldAlert, Droplets, Radio, Activity } from 'lucide-react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons not showing in React/Vite
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const App = () => {
  const [alerts, setAlerts] = useState([]);
  const center = [1.2494, 103.8150]; // Sentosa, Singapore

  // Poll backend every 3 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get('http://localhost:8000/alerts/latest');
        setAlerts(res.data);
      } catch (err) {
        console.error("Backend unreachable - is Member 2 server running?");
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#1C1C1E] text-white font-sans overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-80 border-r border-gray-800 bg-[#2C2C2E] p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="text-red-500" size={24} />
          <h1 className="text-xl font-bold tracking-tight">Aero-ResQ</h1>
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Active Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Scanning coastline...</p>
          ) : (
            alerts.map((alert, i) => (
              <div key={i} className={`p-3 rounded-lg border-l-4 ${alert.status === 'CRITICAL' ? 'bg-red-900/20 border-red-500' : 'bg-yellow-900/20 border-yellow-500'}`}>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm">{alert.device_id}</span>
                  <span className="text-[10px] bg-black/30 px-1 rounded">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs mt-1 text-gray-300">Score: {(alert.distress_score * 100).toFixed(0)}%</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN MAP AREA */}
      <div className="flex-1 relative">
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {alerts.map((alert, i) => (
            <Marker key={i} position={[alert.latitude, alert.longitude]}>
              <Popup>
                <div className="text-black">
                  <strong>{alert.device_id}</strong><br/>
                  Status: {alert.status}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* TOP OVERLAY */}
        <div className="absolute top-4 left-4 z-[1000] flex gap-4">
          <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 text-xs">
            <Radio size={14} className="text-green-500 animate-pulse" />
            <span>Low-Bandwidth Mode: <span className="text-green-500 font-bold">Active</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;