import LocationTracker from "../location";

export function handleUnitAuthenticated(
  message: any,
  socket: WebSocket,
  setMyId: (id: string) => void
): void {
  let isAuthenticated = false;
  const srcId = message.srcId;
  setMyId(srcId);

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
  });
}
