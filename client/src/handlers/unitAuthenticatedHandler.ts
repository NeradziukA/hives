import LocationTracker from "../location";
import { setDriftSpeed } from "../sceneSetup";

export function handleUnitAuthenticated(
  message: any,
  socket: WebSocket,
  setMyId: (id: string) => void,
  onOwnMove?: (coords: { lat: number; lon: number }) => void
): void {
  let isAuthenticated = false;
  const srcId = message.srcId;
  setMyId(srcId);
  localStorage.setItem("playerId", srcId);

  if (message.payload?.config?.cameraDriftSpeed !== undefined) {
    setDriftSpeed(message.payload.config.cameraDriftSpeed);
  }

  const interval = message.payload?.config?.locationUpdateInterval;
  new LocationTracker((coords) => {
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
