# ⚡ Aero-ResQ Nerve Center (Backend)

The **Nerve Center** is the high-performance telemetry broker and rescue management API for the Aero-ResQ system. Built with **FastAPI**, it serves as the critical bridge between Edge-AI drone nodes and the Lifeguard Command Dashboard.

---

## 🛠️ Tech Stack

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous Python 3.12)
- **Environment Manager:** [uv](https://github.com/astral-sh/uv) (For ultra-fast, reproducible builds)
- **Data Validation:** Pydantic v2 (Strict schema enforcement)
- **Architecture:** Modular Router Pattern (Clean separation of concerns)

---

## 🚀 Setup & Execution

### 1. Install Dependencies
Ensure you have `uv` installed, then run the following in the `backend/` directory:
```bash
uv sync
```

### 2. Run the Server
Start the FastAPI server with auto-reload enabled:
```bash
uv run uvicorn app.main:app --reload
```
*The server will be live at: **http://localhost:8000***

### 3. Interactive API Documentation
Access the automatically generated OpenAPI documentation:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📂 Backend Architecture

To ensure high-speed processing of drone telemetry, we implemented a modular "Clean Code" structure:
- `app/main.py`: Entry point, CORS configuration, and API versioning.
- `app/routes.py`: Logic for telemetry processing, rescue dispatch, and bandwidth analytics.
- `app/schemas.py`: Pydantic models ensuring data integrity between the AI and Frontend.
- `app/database.py`: In-memory state manager designed for real-time tracking with zero database latency.

---

## 📡 Key API Endpoints

### 1. Ingress: AI Telemetry
- **`POST /telemetry`**
- Receives 50-byte JSON payloads from the AI drone. 
- *Logic:* Parses skeletal metadata and updates the live triage state in the memory manager.

### 2. Egress: Live Alert Feed
- **`GET /alerts/latest`**
- Provides the frontend with real-time incident data for dynamic map markers.
- **`GET /alerts/history`**
- Returns a chronological log of the last 20 processed emergency events for the Command Center sidebar.

### 3. Action: Rescue Deployment
- **`POST /deploy-rescue`**
- Triggers the system's "Actionable Intervention" protocol. Updates mission status to `RESCUING` and assigns a drone to the target coordinates.

### 4. Innovation: Efficiency Metrics
- **`GET /analytics/bandwidth`**
- Calculates the real-world data savings of our Edge-AI architecture vs. traditional H.264 video streaming.
- **Result:** Consistently demonstrates a **~98% reduction** in network load.

---

## 👥 Backend Development
- **Elvis Ong:** Technical Lead (Architecture, API Design, & Integration)

---

*Part of the Aero-ResQ project for DLW'26.*