# 🎨 Aero-ResQ Commander Dashboard (Frontend)

The "Eyes" of the Aero-ResQ system. A high-fidelity, real-time emergency response dashboard.

## 🛠️ Tech Stack
- **Framework:** React + Vite (Lightning-fast HMR)
- **Styling:** Tailwind CSS v4 (Modern, high-performance CSS-in-JS)
- **Mapping:** Leaflet + OpenStreetMap (Stable, low-bandwidth alternative to Mapbox)
- **Icons:** Lucide-React (Professional, consistent iconography)
- **API Client:** Axios (Robust HTTP requests)

## 🚀 Setup & Run
1. Ensure you are in the `frontend/` directory.
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Browser: `http://localhost:5173`

## 📡 API Integration
- **Backend URL:** `http://localhost:8000`
- **Telemetry Pulling:** Every 3 seconds via `setInterval` in `App.jsx`.
- **Markers:** Automatically rendered on the map based on `latitude` and `longitude` from the backend.

## 📐 Layout Constants
- **Sidebar:** 20rem (320px) fixed width for Alert Feed.
- **Main:** Flexible Map area (100vh).
- **Z-Index Map:** `z-0`
- **Z-Index Overlays:** `z-[1000]` and above.

## 📋 Custom Themes (Tailwind v4)
- `--color-emergency`: `#ef4444` (CRITICAL alerts)
- `--color-warning`: `#f59e0b` (LOW DISTRESS alerts)
- `--color-safe`: `#10b981` (SYSTEM OK)