# 🎨 Aero-ResQ Commander Dashboard (Frontend)

The **Commander Dashboard** is the "Eyes" of the Aero-ResQ system. It is a high-fidelity, real-time emergency response interface designed for lifeguards and search-and-rescue dispatchers to monitor remote water bodies with zero latency.

---

## 🛠️ Tech Stack

- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/) (Lightning-fast HMR and build times)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Modern, high-performance utility-first CSS)
- **Mapping:** [Leaflet.js](https://leafletjs.com/) + OpenStreetMap (A stable, low-bandwidth alternative to Mapbox)
- **Icons:** [Lucide-React](https://lucide.dev/) (Professional, consistent SVG iconography)
- **Networking:** React Hooks + Polling (3s interval for real-time synchronization)

---

## 🚀 Setup & Execution

### 1. Install Dependencies
Ensure you have Node.js installed, navigate to the `frontend/` directory, and run:
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
*The dashboard will be live at: **http://localhost:5173***

---

## 📡 Backend Integration

The dashboard is pre-configured to communicate with the Aero-ResQ Nerve Center (FastAPI) running on **port 8000**. 

- **Data Synchronization:** The app uses a `useEffect` hook to fetch the latest telemetry every 3 seconds from `GET /alerts/latest`.
- **Dynamic Markers:** Red "pulsing" markers are automatically injected and updated on the map based on the GPS coordinates provided in the AI metadata.
- **Automated Dispatch:** The frontend supports the system's "Actionable Intervention" protocol. When an alert is detected, the dashboard triggers a `POST /deploy-rescue` request to update the mission status in the incident log.

---

## ✨ Key UI Features

### 1. High-Fidelity Map Overlay
Uses a Leaflet-based map centered on the **Sentosa Coastline** (Siloso/Palawan Beach). Features custom CSS animations for "Critical" distress zones.

### 2. Command Sidebar & Incident Log
A prioritized feed of active rescues. It tracks the full lifecycle of an emergency:
- **DETECTED:** The moment the AI identifies a struggle.
- **DISPATCHED:** The moment the automated drone response is triggered.
- **RESCUING:** Real-time status tracking of the drone flight.

### 3. Live Efficiency Widget
Displays a real-time **"Bandwidth Saved"** progress bar (synced with the backend analytics engine). This provides visual proof of the system's 98% data efficiency in constrained network environments.

### 4. Color-Coded Triage System
- **CRITICAL (Red):** Immediate threat detected (>70% Distress Score).
- **WARNING (Orange):** Potential distress (40% - 70% Distress Score).
- **SYSTEM ONLINE (Green):** All drones patrolling and functional.

---

## 👥 Frontend Development
- **Zen Ng:** Frontend Lead (UI/UX Design & Mapping Logic)
- **Elvis Ong:** Technical Lead (Integration & State Synchronization)

---

*Part of the Aero-ResQ project for DLW'26.*
