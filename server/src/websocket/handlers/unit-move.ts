import { MessageType, SocketMessage, User, UserList } from "../../types";
import { broadcast } from "./connect";

export function handleUnitMoved(message: SocketMessage, users: UserList) {
  if (message.payload?.coords) {
    // Update coordinates for the user who sent the message
    const user: User = users[message.srcId];
    if (user) {
      user.coords = {
        lat: message.payload.coords.lat,
        lon: message.payload.coords.lon,
      };
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
