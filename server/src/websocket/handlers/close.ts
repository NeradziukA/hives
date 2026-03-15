import { WebSocket } from "ws";
import { MessageType, SocketMessage, User } from "../../types";
import { broadcast } from "./connect";
import { logger } from "../../logger";
import { clearPositionBuffer } from "../../db/queries";

export function handleClose(
  srcId: string,
  ws: WebSocket,
  clientsSockets: { [key: string]: WebSocket },
  users: { [key: string]: User }
) {
  // If another connection replaced this socket, do nothing —
  // the new connection is still live and the player stays on the map.
  if (clientsSockets[srcId] !== ws) {
    logger.info(`Stale socket closed for ${srcId} (replaced by newer connection) — ignoring`);
    return;
  }

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
