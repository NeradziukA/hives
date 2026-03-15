import { MessageType, SocketMessage, User, UserList } from "../../types";
import { broadcast } from "./connect";
import { handlePositionUpdate } from "../../db/queries";
import { logger } from "../../logger";

export function handleUnitMoved(message: SocketMessage, users: UserList) {
  if (message.payload?.coords) {
    // Update coordinates for the user who sent the message
    const user: User = users[message.srcId];
    if (user) {
      user.coords = {
        lat: message.payload.coords.lat,
        lon: message.payload.coords.lon,
      };
      handlePositionUpdate(message.srcId, message.payload.coords.lat, message.payload.coords.lon)
        .catch(err => logger.error("Failed to persist position: " + err));
    }

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
