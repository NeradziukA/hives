import { WebSocket } from "ws";
import { MessageType, SocketMessage } from "../../types";
import { broadcast } from "./connect";

export function handleClose(
  srcId: string,
  clientsSockets: { [key: string]: WebSocket },
  users: { [key: string]: any }
) {
  const message: SocketMessage = {
    type: MessageType.UNIT_DISCONNECTED,
    srcId,
  };
  delete clientsSockets[srcId];
  delete users[srcId];
  console.log("Connection closed: " + srcId);
  broadcast(message, srcId);
}
