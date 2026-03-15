import { WebSocket } from "ws";
import { MessageType, SocketMessage, UserList } from "../../types";
import { getStaticObjects } from "../../api";
import { logger } from "../../logger";

export async function handleUnitGetAll(
  message: SocketMessage,
  clientSocket: WebSocket,
  users: UserList
) {
  const nearStaticObjects = await getStaticObjects();
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
