import { WebSocket } from "ws";
import { MessageType, SocketMessage } from "../../types";
import { broadcast } from "./connect";
import { logger } from "../../logger";
import { clearPositionBuffer } from "../../db/queries";

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
  clearPositionBuffer(srcId);
  logger.info("Connection closed: " + srcId);
  broadcast(message, srcId);
}
