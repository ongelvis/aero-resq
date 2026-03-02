# app/database.py

active_devices = {}
alert_history = []
active_rescues = {}

# Our "Fleet" of drones with their current GPS locations
drones = {
    "DRONE_ALPHA": {
        "status": "PATROLLING", 
        "battery": 88, 
        "type": "MULTI_ROTOR",
        "lat": 1.2494,   # Near Siloso Beach
        "lng": 103.8150,
        "target_lat": None,
        "target_lng": None
    },
    "DRONE_BETA": {
        "status": "IDLE", 
        "battery": 95, 
        "type": "FIXED_WING",
        "lat": 1.2520,   # Near Palawan Beach
        "lng": 103.8210,
        "target_lat": None,
        "target_lng": None
    }
}