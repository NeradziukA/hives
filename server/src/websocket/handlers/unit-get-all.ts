import { WebSocket } from "ws";
import { MessageType, SocketMessage, UserList } from "../../types";
import { getStaticObjects } from "../../api";

export function handleUnitGetAll(
  message: SocketMessage,
  clientSocket: WebSocket,
  users: UserList
) {
  const nearStaticObjects = getStaticObjects();
  const newMessage: SocketMessage = {
    type: MessageType.INIT_UNITS,
    srcId: message.srcId,
    payload: {
      users,
      staticObjects: nearStaticObjects,
    },
  };

  clientSocket.send(JSON.stringify(newMessage));
}
