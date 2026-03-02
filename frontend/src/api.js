// api.js — All backend calls for Aero-ResQ
// Backend base URL (FastAPI running on port 8000)
const BASE_URL = "http://localhost:8000";

export const api = {
  /**
   * POST /telemetry
   * Submits a distress alert from a wearable / AI detection event.
   * Returns { status, alert_id, privacy }
   */
  sendTelemetry: async (payload) => {
    const res = await fetch(`${BASE_URL}/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Telemetry failed: ${res.status}`);
    return res.json();
  },

  /**
   * GET /alerts/latest
   * Returns all currently active device alerts (the "live" incidents on the map).
   */
  getLatestAlerts: async () => {
    const res = await fetch(`${BASE_URL}/alerts/latest`);
    if (!res.ok) throw new Error(`Failed to fetch latest alerts: ${res.status}`);
    return res.json();
  },

  /**
   * GET /alerts/history
   * Returns last 20 processed alerts.
   */
  getAlertHistory: async () => {
    const res = await fetch(`${BASE_URL}/alerts/history`);
    if (!res.ok) throw new Error(`Failed to fetch alert history: ${res.status}`);
    return res.json();
  },

  /**
   * GET /drones
   * Returns the full drone fleet with positions, battery, and status.
   */
  getDrones: async () => {
    const res = await fetch(`${BASE_URL}/drones`);
    if (!res.ok) throw new Error(`Failed to fetch drones: ${res.status}`);
    return res.json();
  },

  /**
   * POST /deploy-rescue
   * Dispatches a drone to an active alert.
   * Body: { alert_id, drone_id, payload_type }
   * Returns { status, target_coords, message }
   */
  deployRescue: async (payload) => {
    const res = await fetch(`${BASE_URL}/deploy-rescue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Deploy rescue failed: ${res.status}`);
    }
    return res.json();
  },

  /**
   * GET /analytics/bandwidth
   * Returns bandwidth savings statistics.
   */
  getBandwidth: async () => {
    const res = await fetch(`${BASE_URL}/analytics/bandwidth`);
    if (!res.ok) throw new Error(`Failed to fetch bandwidth stats: ${res.status}`);
    return res.json();
  },
};
