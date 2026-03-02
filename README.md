# 🛸 Aero-ResQ: AI-Powered Autonomous Lifeguard 🌊

> **Deep Learning Week @ NTU 2026 Submission**  
> An Edge-AI system that detects drowning/distress in real-time and coordinates autonomous drone-based rescue in low-bandwidth, constrained environments.

---

## 🚨 FOR JUDGES: TESTBENCH & EVALUATION
To verify our implementation and run the end-to-end inference simulation, please refer to our **Testbench Folder**.
👉 **[testbench/testbench.md](./testbench/testbench.md)**

---

## 📖 The Vision
In a crisis, seconds matter. Standard surveillance requires high bandwidth and human attention, both of which are scarce in remote coastal areas. **Aero-ResQ** performs on-device Pose Estimation and Optical Flow analysis to identify drowning signatures at the edge. 

By compressing 5MB of visual data into a **50-byte JSON metadata alert**, we bypass network congestion and hardware limitations to deliver life-saving triage in real-time.

---

## 🛠️ Global Setup (Quick Start)

We use `uv` for lightning-fast, reproducible Python environments and `npm` for our dashboard.

### 1. Clone & Sync Python Environment
```bash
git clone https://github.com/YOUR_ORG/aero-resq.git
cd aero-resq
uv sync  # Automatically installs Python 3.12 and all AI/Backend dependencies
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

---

## 📂 Project Structure

| Folder | Responsibility | Tech Stack |
| :--- | :--- | :--- |
| `ai_engine/` | Pose Estimation & Distress Logic | YOLOv8-Pose, OpenCV, Farneback Optical Flow |
| `backend/` | Telemetry API & Logic Bridge | FastAPI (Python 3.12), Pydantic |
| `frontend/` | Lifeguard Command Dashboard | React (Vite), Leaflet.js, Tailwind CSS v4 |
| `testbench/` | **Evaluation Assets** | `drowning.mp4` Test Video, Grader Instructions |

---

## 🏃 Quick Execution

To see the system in action, run these in three separate terminals:

1. **Start Backend:** `cd backend && uv run uvicorn app.main:app --reload`
2. **Start Dashboard:** `cd frontend && npm run dev`
3. **Start AI Node:** `cd ai_engine && uv run main.py`

---

## 🏆 Innovation & Judging Highlights

- **Temporal Deep Learning:** Our solution goes beyond static object detection. We utilize **Temporal Pose Analysis** (analyzing erraticism and bobbing variance over 60-frame buffers) to distinguish between normal swimming and drowning kinematics in real-time.
- **Edge-First Connectivity:** Specifically designed for "Constrained Environments." By processing data on the drone and transmitting only metadata, we achieve a **98% reduction in bandwidth** compared to traditional H.264 video uplinks.
- **Privacy-by-Design:** Our system analyzes skeletal motion signatures, allowing for 100% facial anonymity at the edge. We transmit only risk scores and coordinates, ensuring the system is ethically compliant for public use.
- **Actionable Intervention:** The dashboard features an **Automated Dispatch Protocol**. Once a distress event is verified by AI, the system simulates the immediate deployment of a rescue drone, updating the incident log and triage status instantly.

---

## 👥 The Team (Aero-ResQ Squad)

- **Elvis Ong:** Technical Lead (Full Stack Architecture & AI Integration)
- **Zen Ng:** Frontend Developer (Real-time Dashboard & Mapping UI)
- **Kyle Yeo:** AI/Computer Vision Engineer (Action Recognition & Pose Logic)
- **Elston Leng:** AI/Computer Vision Engineer (Temporal Flow & Data Processing)
- **Ernest See:** Data Specialist & Strategy (Asset Curation & Documentation)

---

*All source code and assets were developed within the 48-hour DLW'26 hackathon window.*