import LocationTracker from "../location";
import { setDriftSpeed } from "../sceneSetup";

type UnitAuthenticatedMessage = {
  srcId: string;
  payload?: { config?: { cameraDriftSpeed?: number; locationUpdateInterval?: number } };
};

let activeTracker: LocationTracker | null = null;

export function handleUnitAuthenticated(
  message: UnitAuthenticatedMessage,
  socket: WebSocket,
  setMyId: (id: string) => void,
  onOwnMove?: (coords: { lat: number; lon: number }) => void
): void {
  activeTracker?.stopTracking();

  let isAuthenticated = false;
  const srcId = message.srcId;
  setMyId(srcId);
  localStorage.setItem("playerId", srcId);

  if (message.payload?.config?.cameraDriftSpeed !== undefined) {
    setDriftSpeed(message.payload.config.cameraDriftSpeed);
  }

  const interval = message.payload?.config?.locationUpdateInterval;
  activeTracker = new LocationTracker((coords) => {
    if (!isAuthenticated) {
      socket.send(
        JSON.stringify({
          type: "UNIT_GET_ALL",
          srcId,
          payload: {
            coords: {
              lat: coords.lat,
              lon: coords.lon,
            },
          },
        })
      );
      isAuthenticated = true;
    }
    socket.send(
      JSON.stringify({
        type: "UNIT_MOVED",
        srcId,
        payload: {
          coords: {
            lat: coords.lat,
            lon: coords.lon,
          },
        },
      })
    );
    onOwnMove?.(coords);
  }, interval);
}
