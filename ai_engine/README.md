# 🧠 Aero-ResQ AI Engine (The "Eyes")

The **AI Engine** is the high-speed edge inference module of the Aero-ResQ system. Designed to run locally on drone hardware, it utilizes **Deep Learning** and **Temporal Kinematics** to detect drowning signatures in real-time while maintaining 100% data privacy.

---

## 🛠️ Tech Stack

- **Model:** [Ultralytics YOLOv8-Pose](https://docs.ultralytics.com/tasks/pose/) (For skeletal keypoint extraction)
- **Computer Vision:** [OpenCV](https://opencv.org/) (Farneback Optical Flow & Image Processing)
- **Environment:** Python 3.12 (Managed via `uv`)
- **Inference:** Temporal Buffer Analysis (60-frame windows)

---

## 🚀 Setup & Execution

### 1. Install Dependencies
Ensure you have `uv` installed, then run the following in the `ai_engine/` directory:
```bash
uv sync
```

### 2. Run the Inference Script
```bash
uv run main.py
```
*Note: On the first run, the script will automatically download the pre-trained `yolov8n-pose.pt` weights (approx. 6MB).*

---

## 🧠 The Deep Learning Methodology

Unlike traditional "static" object detectors, Aero-ResQ analyzes **Human Kinematics over time**. Our approach focuses on three specific drowning signatures:

### 1. Chaotic Erraticism (Optical Flow)
Using the **Farneback Algorithm**, we measure the variance in pixel velocity within the human bounding box. 
- **Normal Swimming:** Directed, rhythmic, and low-variance motion.
- **Drowning (Distress):** High-variance, multidirectional, and chaotic "splashing" motion.

### 2. The "Ladder Climb" (Vertical Bobbing)
We track the **Y-coordinate variance** of skeletal joints (Nose, Shoulders) over a 60-frame buffer. Rapid vertical oscillations (bobbing) without horizontal displacement are flagged as high-risk "Instinctive Drowning Response" indicators.

### 3. Positional Confinement
We calculate the **Movement Radius** of the tracked ID. If a person displays high frantic motion but zero net displacement (traveling less than a 200px radius), the "Distress Score" increases exponentially.

---

## 🛡️ Privacy-by-Design

Aero-ResQ solves the ethical challenge of public surveillance:
- **Identity-Agnostic:** The AI processes skeletal "stick figures," ignoring facial features and personal identifiers.
- **Edge-Compression:** Instead of transmitting raw video, the engine extracts only the 17 skeletal keypoints.
- **Metadata Output:** Only the final **Distress Score** and **GPS Coordinates** are sent to the backend, ensuring no visual data ever leaves the local drone hardware.

---

## 📊 Performance & Optimization

- **Inference Speed:** ~15-20 FPS on standard CPU (optimized for edge devices).
- **Network Load:** ~1.25 KB/s telemetry stream (98% reduction vs. video streaming).
- **Triage Accuracy:** Specifically tuned to ignore "Power Swimmers" by applying a Travel-Velocity Penalty to the distress score.

---

## 👥 AI Team

- **Kyle Yeo:** AI/Computer Vision Engineer (Pose Estimation & Logic)
- **Elston Leng:** AI/Computer Vision Engineer (Temporal Motion & Data)
- **Ernest See:** Data Specialist & Strategy (Asset Curation & Dataset Management)
- **Elvis Ong:** Technical Lead (Algorithm Optimization & Backend Bridge)

---

*Part of the Aero-ResQ project for DLW'26.*