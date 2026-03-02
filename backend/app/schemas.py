# app/schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DistressAlert(BaseModel):
    device_id: str
    latitude: float
    longitude: float
    distress_score: float # 0.0 to 1.0
    status: str           # "SAFE", "WARNING", "CRITICAL"
    privacy_mode: bool    # TRUE = Joint Data Only, FALSE = Low-Res Snapshot
    joint_data: Optional[List[float]] = None # Optional skeletal coordinates

class RescueRequest(BaseModel):
    alert_id: str
    drone_id: str
    payload_type: str     # "FLOTATION_V1", "MEDICAL_KIT", "LIGHT_SIGNAL"

class BandwidthStats(BaseModel):
    total_pings: int
    data_sent_kb: float
    traditional_video_mb: float
    savings_percent: str
    privacy_score: str