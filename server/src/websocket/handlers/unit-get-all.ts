import { WebSocket } from "ws";
import { MessageType, SocketMessage, UserList } from "../../types";

export function handleUnitGetAll(
  message: SocketMessage,
  clientSocket: WebSocket,
  users: UserList
) {
  const newMessage: SocketMessage = {
    type: MessageType.INIT_UNITS,
    srcId: message.srcId,
    payload: {
      users,
    },
  };

  clientSocket.send(JSON.stringify(newMessage));
}
