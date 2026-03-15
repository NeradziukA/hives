// Game configuration — sent to clients on connection
export const CAMERA_DRIFT_SPEED = 0.05; // lerp factor per frame (0 = no drift, 1 = instant)
export const LOCATION_UPDATE_INTERVAL = 10000; // ms between GPS updates sent to server

// Server-side idle timeout: close connections that send no UNIT_MOVED for this long
export const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
