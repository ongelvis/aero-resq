# app/routes.py
from fastapi import APIRouter, HTTPException
from .schemas import DistressAlert, RescueRequest, BandwidthStats
from .database import active_devices, alert_history, drones, active_rescues
import uuid
from datetime import datetime

router = APIRouter()

# --- 1. THE BRAIN (Telemetry) ---
@router.post("/telemetry")
async def receive_telemetry(alert: DistressAlert):
    alert_id = str(uuid.uuid4())[:8]
    data = alert.dict()
    data["id"] = alert_id
    data["timestamp"] = datetime.now().strftime("%H:%M:%S")
    
    # Store the alert
    active_devices[alert.device_id] = data
    alert_history.insert(0, data)
    
    # Automatic Triage: If score is critical, we log it for the dashboard
    if alert.distress_score > 0.8:
        print(f"🚨 CRITICAL DISTRESS AT {alert.latitude}, {alert.longitude}")
        
    return {"status": "success", "alert_id": alert_id, "privacy": alert.privacy_mode}

# --- 2. THE EYES (Dashboard Feed) ---
@router.get("/alerts/latest")
async def get_latest():
    return list(active_devices.values())

@router.get("/alerts/history")
async def get_history():
    return alert_history[:20]

@router.get("/drones")
async def get_drones():
    return drones

# --- 3. THE ACTION (Intervention) ---
@router.post("/deploy-rescue")
async def deploy_rescue(req: RescueRequest):
    if req.drone_id not in drones:
        raise HTTPException(status_code=404, detail="Rescue Drone not found")
    
    # 1. Find the alert to get the victim's coordinates
    # We look through active_devices to find where the distress is
    target_alert = next((a for a in alert_history if a["id"] == req.alert_id), None)
    
    if not target_alert:
        raise HTTPException(status_code=404, detail="Target Alert not found")

    # 2. Update Drone State to "Rescue Mode"
    rescue_id = f"RESQ_{uuid.uuid4().hex[:4].upper()}"
    drones[req.drone_id]["status"] = "RESCUING"
    drones[req.drone_id]["target_lat"] = target_alert["latitude"]
    drones[req.drone_id]["target_lng"] = target_alert["longitude"]
    
    # 3. Log the Rescue
    active_rescues[rescue_id] = {
        "alert_id": req.alert_id,
        "drone_id": req.drone_id,
        "payload": req.payload_type,
        "start_time": datetime.now().isoformat()
    }
    
    return {
        "status": "RESCUE_IN_PROGRESS",
        "target_coords": {"lat": target_alert["latitude"], "lng": target_alert["longitude"]},
        "message": f"Drone {req.drone_id} is intercepting target."
    }

# --- 4. THE PROOF (Innovation Metrics) ---
@router.get("/analytics/bandwidth")
async def get_bandwidth_metrics():
    pings = len(alert_history)
    # Metadata (50 bytes) vs traditional CCTV stream (approx 2MB/sec)
    metadata_kb = pings * 0.05 
    traditional_mb = pings * 2.0 
    
    savings = 100 - ((metadata_kb / (traditional_mb * 1024)) * 100)
    
    return {
        "total_pings_processed": pings,
        "bandwidth_saved": f"{savings:.2f}%",
        "aero_resq_usage": f"{metadata_kb:.2f} KB",
        "traditional_usage": f"{traditional_mb:.2f} MB",
        "privacy_compliance": "High (Skeletal Data Only)"
    }