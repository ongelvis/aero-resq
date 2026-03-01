# 🛸 Aero-ResQ: AI-Powered Autonomous Lifeguard 🌊

> **Deep Learning Week @ NTU 2026 Submission**  
> An Edge-AI system that detects drowning/distress in real-time and coordinates autonomous drone-based rescue in low-bandwidth, constrained environments.

---

## 📖 The Vision
In a crisis, seconds matter. Standard surveillance requires high bandwidth and human attention. **Aero-ResQ** uses on-device Pose Estimation to identify drowning patterns, compressing 5MB of visual data into a **50-byte JSON metadata alert** that can bypass network congestion to save lives.

---

## 🛠️ Pre-Flight Checklist (Installation)

Before you start, ensure you have the "Core 3" installed. Follow the commands for your OS.

### 1. Python Environment Manager (`uv`)
*   **macOS (Homebrew):** `brew install uv`
*   **Windows (PowerShell):** `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`
*   *Note: We use Python 3.12 for stability with AI libraries.*

### 2. Node.js (For Dashboard)
*   **macOS:** `brew install node`
*   **Windows:** Download from [nodejs.org](https://nodejs.org/) (LTS version).

### 3. Git
*   **macOS:** `brew install git`
*   **Windows:** Download [Git for Windows](https://git-scm.com/).

---

## 🚀 Getting Started (The 5-Minute Setup)

Run these commands in your terminal to set up the entire project across all devices:

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_ORG/aero-resq.git
cd aero-resq

# 2. Sync Python Environment (Automatically installs 3.12 and all dependencies)
uv sync

# 3. Setup Frontend
cd frontend
npm install
```

---

## 📂 Project Structure & Team Roles

| Folder | Responsibility | Tech Stack | Leads |
| :--- | :--- | :--- | :--- |
| `ai_engine/` | Pose Estimation & Distress Logic | YOLOv11-Pose, OpenCV | **Members 1A & 1B** |
| `backend/` | Telemetry API & Logic Bridge | FastAPI, Pydantic | **Member 2** |
| `frontend/` | Lifeguard Command Dashboard | Next.js, Mapbox, Tailwind | **Member 3** |
| `data/` | Dataset Curation & Pitch Assets | — | **Member 4** |
| **Project** | Pitch, Strategy, & Design | Figma, Canva | **All (Member 5)** |

---

## 🏃 Execution Guide

### 🧠 Running the AI Engine
```bash
cd ai_engine
uv run main_tracker.py
```
*The script will auto-download the YOLO weights on the first run.*

### ⚡ Running the Backend
```bash
cd backend
uv run uvicorn server:app --reload
```
*API Docs available at: http://localhost:8000/docs*

### 🎨 Running the Dashboard
```bash
cd frontend
npm run dev
```
*Dashboard available at: http://localhost:3000*

---

## 📋 Technical Requirements & Troubleshooting

- **Python Version:** 3.12 (Strictly enforced by `.python-version`)
- **Node Version:** 18.x or 20.x
- **Windows Users:** If PowerShell blocks `uv` scripts, run:  
  `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- **Low-Bandwidth Simulation:** To test the "Constrained Environment" mode, toggle the switch in the Frontend Dashboard to see only metadata pings.

---

## 🏆 Judging Highlights (For Evaluators)
- **Deep Learning:** Uses Temporal Pose Analysis to detect drowning signatures vs. normal swimming.
- **Innovation:** Prioritizes privacy (transmits skeletal data, not faces) and network resilience.
- **Impact:** Focused on Singapore's "Golden Hour" for water rescue in unmonitored zones.