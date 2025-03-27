import { MessageType, SocketMessage } from "../../types";
import { broadcast } from "./connect";

export function handleUnitMoved(message: SocketMessage) {
  if (message.payload?.coords) {
    const newMessage: SocketMessage = {
      type: MessageType.UNIT_MOVED,
      srcId: message.srcId,
      payload: {
        coords: {
          lat: message.payload.coords.lat,
          lon: message.payload.coords.lon,
        },
      },
    };

    broadcast(newMessage, message.srcId);
  }
}
