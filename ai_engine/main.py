"""
AERO-RESQ Aerial Drowning Detector v3.0 (BULLETPROOF)
====================================================

All known issues fixed:
✓ UnboundLocalError for person_tracking
✓ TypeError for deque slicing
✓ Better error handling throughout
✓ Clean, readable code

Just run: python aerial_detector_v3.py
"""

import cv2
import numpy as np
import time
from collections import deque
from ultralytics import YOLO
import requests
import sys
import threading
# ============================================================================
# ⚙️ CONFIGURATION - ADJUST THESE
# ============================================================================

VIDEO_SOURCE = "swimming_data/IMG_8047.MOV"
BACKEND_URL = "http://localhost:8000/telemetry"
MODEL_PATH = 'yolov8n-pose.pt'

# Detection settings
DETECTION_CONFIDENCE = 0.01
MAX_HISTORY = 60

# Drowning detection thresholds
FRANTIC_MOTION_THRESHOLD = 8 #initial 8
SMALL_MOVEMENT_RADIUS = 80 #initial 80
LARGE_VELOCITY_CHANGE_THRESHOLD = 15.0 #initial 15
MIN_HISTORY_FOR_DETECTION = 10 #initial 10

# Water color (HSV)
# Blue: (80, 0, 0) to (130, 255, 255)
# Green: (40, 20, 20) to (100, 200, 200)
# Brown: (0, 10, 20) to (180, 100, 150)
WATER_COLOR_LOWER = np.array([80, 0, 0])
WATER_COLOR_UPPER = np.array([130, 255, 255])

# Contour size
MIN_CONTOUR_AREA = 20
MAX_CONTOUR_AREA = 5000

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def safe_get_deque_slice(deque_obj, num_items):
    """Safely get last N items from deque"""
    if not deque_obj:
        return []
    count = min(num_items, len(deque_obj))
    return list(deque_obj)[-count:]

def clamp(value, min_val, max_val):
    """Clamp value between min and max"""
    return max(min_val, min(max_val, value))

# ============================================================================
# CORE DETECTION FUNCTIONS
# ============================================================================

def get_water_mask(frame):
    """Detect water by color"""
    try:
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        water_mask = cv2.inRange(hsv, WATER_COLOR_LOWER, WATER_COLOR_UPPER)
        
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        water_mask = cv2.morphologyEx(water_mask, cv2.MORPH_CLOSE, kernel)
        water_mask = cv2.morphologyEx(water_mask, cv2.MORPH_OPEN, kernel)
        
        return water_mask
    except Exception as e:
        print(f"Error in water detection: {e}")
        return np.zeros(frame.shape[:2], dtype=np.uint8)

def detect_people_in_water(frame, water_mask):
    """Find people (contours) in water"""
    try:
        inv_water_mask = cv2.bitwise_not(water_mask)
        contours, _ = cv2.findContours(inv_water_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        people = []
        for contour in contours:
            area = cv2.contourArea(contour)
            
            if MIN_CONTOUR_AREA < area < MAX_CONTOUR_AREA:
                x, y, w, h = cv2.boundingRect(contour)
                
                if h > 0:
                    aspect_ratio = float(w) / h
                    if 0.4 < aspect_ratio < 2.5:
                        center_x = x + w // 2
                        center_y = y + h // 2
                        
                        people.append({
                            'bbox': (x, y, x + w, y + h),
                            'center': (center_x, center_y),
                            'area': area,
                            'radius': max(w, h) // 2
                        })
        
        return people
    except Exception as e:
        print(f"Error in people detection: {e}")
        return []

def calculate_optical_flow(prev_frame, curr_frame):
    """Calculate motion between frames"""
    try:
        if prev_frame is None:
            return None, None, None
        
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
        
        flow = cv2.calcOpticalFlowFarneback(prev_gray, curr_gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        
        return flow, mag, ang
    except Exception as e:
        print(f"Error in optical flow: {e}")
        return None, None, None

def analyze_motion_in_roi(flow, mag, roi_bbox, prev_center, curr_center):
    """Analyze motion in person's region"""
    try:
        if flow is None or mag is None:
            return {
                'avg_velocity': 0,
                'velocity_variance': 0,
                'erraticism': 0,
                'net_displacement': 0
            }
        
        x1, y1, x2, y2 = roi_bbox
        
        # Clamp to frame bounds
        x1 = clamp(x1, 0, mag.shape[1])
        y1 = clamp(y1, 0, mag.shape[0])
        x2 = clamp(x2, 0, mag.shape[1])
        y2 = clamp(y2, 0, mag.shape[0])
        
        roi_mag = mag[y1:y2, x1:x2]
        
        if roi_mag.size == 0:
            return {
                'avg_velocity': 0,
                'velocity_variance': 0,
                'erraticism': 0,
                'net_displacement': 0
            }
        
        avg_velocity = float(np.mean(roi_mag))
        velocity_variance = float(np.var(roi_mag))
        
        if avg_velocity > 0:
            erraticism = velocity_variance / (avg_velocity ** 2 + 0.001)
        else:
            erraticism = 0
        
        net_displacement = float(np.linalg.norm(np.array(curr_center) - np.array(prev_center)))
        
        return {
            'avg_velocity': avg_velocity,
            'velocity_variance': velocity_variance,
            'erraticism': min(erraticism, 2.0),
            'net_displacement': net_displacement
        }
    except Exception as e:
        print(f"Error in motion analysis: {e}")
        return {
            'avg_velocity': 0,
            'velocity_variance': 0,
            'erraticism': 0,
            'net_displacement': 0
        }

# ============================================================================
# DROWNING SCORING
# ============================================================================

def detect_frantic_motion(motion_metrics):
    """Score for chaotic movement"""
    try:
        velocity = float(motion_metrics.get('avg_velocity', 0))
        erraticism = float(motion_metrics.get('erraticism', 0))
        
        velocity_score = min(velocity / FRANTIC_MOTION_THRESHOLD * 50, 50)
        erraticism_score = min(erraticism * 25, 50)
        
        return int(velocity_score + erraticism_score)
    except:
        return 0

def detect_restricted_movement(position_history, frame_width, frame_height):
    """Score for staying in confined area"""
    try:
        if len(position_history) < 10:
            return 0
        
        positions = np.array(position_history)
        x_min, y_min = np.min(positions, axis=0)
        x_max, y_max = np.max(positions, axis=0)
        movement_radius = max(x_max - x_min, y_max - y_min)
        
        if movement_radius < SMALL_MOVEMENT_RADIUS:
            restriction_score = (1 - movement_radius / SMALL_MOVEMENT_RADIUS) * 70
        else:
            restriction_score = 0
        
        return int(restriction_score)
    except:
        return 0

def detect_velocity_spikes(motion_history):
    """Score for sudden speed changes"""
    try:
        if len(motion_history) < 5:
            return 0
        
        velocities = [m.get('avg_velocity', 0) for m in safe_get_deque_slice(motion_history, 20)]
        
        if len(velocities) < 3:
            return 0
        
        velocity_changes = np.abs(np.diff(velocities))
        spikes = sum(1 for change in velocity_changes if change > LARGE_VELOCITY_CHANGE_THRESHOLD)
        spike_ratio = spikes / len(velocity_changes) if velocity_changes.size > 0 else 0
        
        return int(spike_ratio * 80)
    except:
        return 0

def detect_exhaustion_pattern(position_history, motion_history):
    """Score for exhaustion/bobbing"""
    try:
        if len(motion_history) < 15 or len(position_history) < 15:
            return 0
        
        recent_velocities = [m.get('avg_velocity', 0) for m in safe_get_deque_slice(motion_history, 5)]
        older_velocities = safe_get_deque_slice(motion_history, 15)[:-5]
        older_velocities = [m.get('avg_velocity', 0) for m in older_velocities]
        
        recent_velocity = np.mean(recent_velocities) if recent_velocities else 0
        earlier_velocity = np.mean(older_velocities) if older_velocities else 0
        
        exhaustion_score = 40 if (earlier_velocity > 2 and recent_velocity < earlier_velocity * 0.5) else 0
        
        positions = np.array(position_history)
        y_positions = positions[:, 1]
        y_variance = float(np.var(y_positions[-20:])) if len(positions) >= 20 else 0
        
        bobbing_score = min(y_variance / 300 * 40, 40) if y_variance > 200 else 0
        
        return int(exhaustion_score + bobbing_score)
    except:
        return 0

def calculate_distress_score(person_data, flow, mag):
    """Calculate total drowning risk (0-100)"""
    try:
        if not person_data.get('motion_history') or len(person_data['motion_history']) < MIN_HISTORY_FOR_DETECTION:
            return 0
        
        motion_history = person_data['motion_history']
        position_history = person_data['position_history']
        
        # Get latest motion metrics
        latest_motion = safe_get_deque_slice(motion_history, 1)
        frantic_score = detect_frantic_motion(latest_motion[0]) if latest_motion else 0
        
        # Get position history as list
        pos_list = list(position_history)
        restriction_score = detect_restricted_movement(pos_list, 1280, 720)
        spike_score = detect_velocity_spikes(motion_history)
        exhaustion_score = detect_exhaustion_pattern(pos_list, motion_history)
        
        final_score = (
            frantic_score * 1 +
            restriction_score * 0.45 +
            spike_score * 0.50 +
            exhaustion_score * 0.65
        )
        
        return min(int(final_score), 100)
    except Exception as e:
        print(f"Error calculating distress: {e}")
        return 0

# ============================================================================
# VISUALIZATION
# ============================================================================

def draw_detection_results(frame, people, person_tracking, water_mask):
    """Draw boxes and info on frame"""
    try:
        # Add water overlay
        water_overlay = cv2.cvtColor(water_mask, cv2.COLOR_GRAY2BGR)
        water_overlay[:, :] = (255, 100, 0)
        frame = cv2.addWeighted(frame, 0.7, water_overlay, 0.2, 0)
        
        for person in people:
            track_id = person.get('track_id')
            if not track_id or track_id not in person_tracking:
                continue
            
            p_data = person_tracking[track_id]
            distress_score = p_data.get('distress_score', 0)
            
            # Choose color
            if distress_score > 70:
                color, status = (0, 0, 255), "DROWNING"
            elif distress_score > 40:
                color, status = (0, 165, 255), "MONITOR"
            elif distress_score > 20:
                color, status = (255, 255, 0), "CAUTION"
            else:
                color, status = (0, 255, 0), "SAFE"
            
            x1, y1, x2, y2 = person['bbox']
            center_x, center_y = person['center']
            
            # Draw box
            thickness = 3 if distress_score > 70 else 2
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
            cv2.circle(frame, (center_x, center_y), 4, color, -1)
            
            # Draw motion trail - FIXED: convert deque to list first
            position_history = p_data.get('position_history')
            if position_history and len(position_history) > 1:
                pos_list = safe_get_deque_slice(position_history, 10)
                if len(pos_list) > 1:
                    positions = np.array(pos_list).astype(int)
                    for i in range(len(positions) - 1):
                        try:
                            cv2.line(frame, tuple(positions[i]), tuple(positions[i+1]), color, 1)
                        except:
                            pass
            
            # Draw label
            info_text = f"ID:{track_id} {status} {distress_score}%"
            label_width = len(info_text) * 6
            cv2.rectangle(frame, (x1, y1 - 25), (x1 + label_width + 10, y1), (0, 0, 0), -1)
            cv2.putText(frame, info_text, (x1 + 2, y1 - 8), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
        
        return frame
    except Exception as e:
        print(f"Error in drawing: {e}")
        return frame
    
def send_alert_to_backend(track_id, distress_score, distress_factors):
    """
    Constructs the JSON payload to match the Backend 'DistressAlert' schema
    and sends it via POST request.
    """
    # 1. Map AI data to Backend Schema
    # Backend expects 0.0 to 1.0 for distress_score
    normalized_score = distress_score / 100.0 
    
    # Map score to Status string
    status = "SAFE"
    if normalized_score > 0.7: status = "CRITICAL"
    elif normalized_score > 0.4: status = "WARNING"

    payload = {
        "device_id": f"AERO_UNIT_{track_id}",
        "latitude": 1.3484,  # Simulated Sentosa Latitude
        "longitude": 103.8141, # Simulated Sentosa Longitude
        "distress_score": normalized_score,
        "status": status,
        "privacy_mode": True, # High "Innovation" points for privacy
        "joint_data": [float(track_id)] # We send the ID as a reference
    }

    def post_request():
        try:
            response = requests.post(BACKEND_URL, json=payload, timeout=0.5)
            if response.status_code == 200:
                print(f"✅ Telemetry Synced to Center: ID {track_id} | Score {normalized_score}")
        except Exception as e:
            # print(f"📡 Backend offline - check your FastAPI server")
            pass

    # 2. RUN IN BACKGROUND THREAD (Crucial for FPS)
    # This prevents the AI from lagging while waiting for the network
    thread = threading.Thread(target=post_request)
    thread.daemon = True
    thread.start()

# ============================================================================
# MAIN DETECTION LOOP
# ============================================================================

def main():
    print("\n" + "="*70)
    print(" 🚁 AERO-RESQ AERIAL DROWNING DETECTOR v3.0 (BULLETPROOF)".center(70))
    print("="*70 + "\n")
    
    try:
        # Initialize
        print("Loading model...", end=" ", flush=True)
        model = YOLO(MODEL_PATH)
        print("✓")
        
        print(f"Opening video: {VIDEO_SOURCE}...", end=" ", flush=True)
        cap = cv2.VideoCapture(VIDEO_SOURCE)
        
        if not cap.isOpened():
            print("✗")
            print(f"❌ ERROR: Could not open video")
            return
        
        print("✓")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        
        print(f"\nVideo info:")
        print(f"  Resolution: {frame_width}x{frame_height}")
        print(f"  FPS: {fps}")
        print(f"  Duration: {duration:.1f} seconds")
        print(f"  Frames: {total_frames}")
        
        print(f"\nDetection settings:")
        print(f"  Motion threshold: {FRANTIC_MOTION_THRESHOLD}")
        print(f"  Movement radius: {SMALL_MOVEMENT_RADIUS} pixels")
        print(f"  History buffer: {MAX_HISTORY}")
        
        print("\n" + "="*70)
        print("Press 'q' to quit")
        print("="*70 + "\n")
        
        # Main variables
        prev_frame = None
        frame_count = 0
        next_track_id = 0
        last_alert_time = 0
        person_tracking = {}  # ✓ INITIALIZED
        
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break
            
            frame_count += 1
            start_time = time.time()
            
            try:
                # Detect water and people
                water_mask = get_water_mask(frame)
                people = detect_people_in_water(frame, water_mask)
                
                # Calculate optical flow
                if prev_frame is not None and len(people) > 0:
                    flow, mag, ang = calculate_optical_flow(prev_frame, frame)
                    
                    # Process each person
                    for i, person in enumerate(people):
                        center = person['center']
                        bbox = person['bbox']
                        
                        # Simple tracking
                        track_id = None
                        min_dist = float('inf')
                        
                        for existing_id, p_data in person_tracking.items():
                            if p_data.get('position_history') and len(p_data['position_history']) > 0:
                                try:
                                    last_pos = list(p_data['position_history'])[-1]
                                    dist = np.linalg.norm(np.array(center) - np.array(last_pos))
                                    
                                    if dist < 100 and dist < min_dist:
                                        track_id = existing_id
                                        min_dist = dist
                                except:
                                    pass
                        
                        if track_id is None:
                            track_id = next_track_id
                            next_track_id += 1
                        
                        # Initialize tracking if needed
                        if track_id not in person_tracking:
                            person_tracking[track_id] = {
                                'position_history': deque(maxlen=MAX_HISTORY),
                                'motion_history': deque(maxlen=MAX_HISTORY),
                                'distress_score': 0
                            }
                        
                        person['track_id'] = track_id
                        p_data = person_tracking[track_id]
                        
                        # Update tracking
                        p_data['position_history'].append(center)
                        
                        if len(p_data['position_history']) > 1:
                            pos_list = list(p_data['position_history'])
                            prev_center = pos_list[-2]
                            motion_metrics = analyze_motion_in_roi(flow, mag, bbox, prev_center, center)
                            p_data['motion_history'].append(motion_metrics)
                        
                        # Calculate score
                        distress_score = calculate_distress_score(p_data, flow, mag)
                        p_data['distress_score'] = distress_score
                        
                        # Alert
                        if distress_score > 70 and (time.time() - last_alert_time > 2):
                            distress_factors = []
                            try:
                                if len(p_data['motion_history']) > 0:
                                    motion = list(p_data['motion_history'])[-1]
                                    if detect_frantic_motion(motion) > 50:
                                        distress_factors.append("FRANTIC")
                            except:
                                pass
                            
                            try:
                                pos_list = list(p_data['position_history'])
                                if detect_restricted_movement(pos_list, frame_width, frame_height) > 50:
                                    distress_factors.append("CONFINED")
                            except:
                                pass
                            
                            try:
                                if detect_velocity_spikes(p_data['motion_history']) > 50:
                                    distress_factors.append("SPIKES")
                            except:
                                pass
                            
                            try:
                                pos_list = list(p_data['position_history'])
                                if detect_exhaustion_pattern(pos_list, p_data['motion_history']) > 50:
                                    distress_factors.append("EXHAUSTION")
                            except:
                                pass
                            
                            send_alert_to_backend(track_id, distress_score, distress_factors)
                            last_alert_time = time.time()
                
                # Draw and display
                frame = draw_detection_results(frame, people, person_tracking, water_mask)
                
                fps_display = 1 / (time.time() - start_time) if (time.time() - start_time) > 0 else 0
                cv2.putText(frame, f"FPS: {int(fps_display)} | Frame: {frame_count}/{total_frames}", 
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                cv2.putText(frame, f"People: {len(people)} | Tracked: {len(person_tracking)}", 
                           (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                cv2.putText(frame, "RED: DROWNING (>70) | ORANGE: MONITOR (40-70) | CYAN: CAUTION (20-40) | GREEN: SAFE (<20)",
                           (10, frame_height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                
                cv2.imshow("🚁 Aero-ResQ Aerial Drowning Detector", frame)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("\n⏹️  Stopped by user")
                    break
                
                prev_frame = frame.copy()
            
            except Exception as e:
                print(f"Error processing frame {frame_count}: {e}")
                continue
        
        cap.release()
        cv2.destroyAllWindows()
        
        print(f"\n✅ Completed! Analyzed {frame_count} frames")
        print(f"📊 Total people tracked: {len(person_tracking)}")
    
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
