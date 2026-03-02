# 🧪 Aero-ResQ Testbench: Evaluation & Inference Guide

Welcome, Judges. This testbench simulates our end-to-end Edge-AI pipeline, demonstrating how **Aero-ResQ** triages drowning events in real-time and transmits lightweight telemetry to a central command dashboard.

---

## 📋 Prerequisites

To run this simulation, ensure you have the following installed:
1. **Python 3.12+** (Managed via `uv` in the project root).
2. **Node.js 18+** (For the Frontend Dashboard).
3. **Test Video:** Ensure `drowning.mp4` is present in this `testbench/` folder.

---

## 🚀 Step 1: Initialize the Global Environment

We use a **`uv` Workspace** to ensure perfect dependency synchronization across the AI Engine and the Backend.

1. Open your terminal in the **project root folder** (`aero-resq/`).
2. Run the global sync command:
   ```bash
   uv sync
   ```
*This will automatically install Python 3.12 and all required libraries (FastAPI, YOLOv8, OpenCV, etc.) for the entire project.*

---

## 🏃 Step 2: Running the Simulation

Please open **three separate terminal windows** to observe the data flow in real-time.

### Terminal 1: The Nerve Center (Backend)
The backend acts as the telemetry broker, receiving 50-byte JSON pings from the edge drone.
1. Navigate to the backend directory and start the server:
   ```bash
   cd backend
   uv run uvicorn app.main:app --reload
   ```
*The API is now live at **http://localhost:8000**.*

### Terminal 2: The Command Dashboard (Frontend)
The dashboard provides situational awareness and rescue management for lifeguards.
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
*Open **http://localhost:5173** in your browser to view the Command Center.*

### Terminal 3: The Edge-AI Drone Inference (AI Engine)
We use the provided `drowning.mp4` to simulate the drone's live camera feed.
1. Navigate to the `ai_engine` directory:
   ```bash
   cd ai_engine
   ```
2. Run the inference script:
   ```bash
   uv run main.py
   ```

---

## 🎯 Evaluation Objectives (What to Observe)

### 1. Real-Time Deep Learning Triage
As the `main.py` script processes the video, you will see a CV window showing **YOLOv8-Pose** tracking. 
- **The Detection:** Our system calculates a **Distress Score** based on vertical bobbing and frantic motion signatures.
- **The Trigger:** Once the score crosses **70%**, a red box appears on the AI feed, and a telemetry ping is sent to the backend.

### 2. Dashboard Integration & Bandwidth Efficiency
Check your browser (**http://localhost:5173**). 
- **The Ping:** A red pulsing alert marker will instantly appear on the map at the victim's GPS coordinates.
- **Innovation Metric:** Look at the **"Live Bandwidth Saved"** widget. Our system achieves a **~98% reduction in data usage** by transmitting JSON metadata instead of raw H.264 video.

### 3. Automated Intervention
Observe the **Incident Log** in the dashboard sidebar. 
- The system automatically triggers a **"DRONE AUTO-DEPLOYED"** status upon AI verification.
- The UI tracks the mission status through **"DETECTED"** and **"DISPATCHED"** phases, simulating a physical rescue intervention.

---

## 📚 Technical Methodology (Summary)
- **Object Detection:** YOLOv8-Pose (extracted skeletal keypoints for privacy).
- **Kinematic Analysis:** Temporal Buffer analysis of "Erraticism" (variance in optical flow) and "Bobbing" (Y-coordinate variance).
- **Network Optimization:** Edge-inference architecture to support high-latency "Constrained Environments" as per the DLW'26 brief.

---

*All source code and assets were developed within the 48-hour DLW'26 hackathon window.*