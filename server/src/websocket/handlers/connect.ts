import { WebSocket } from "ws";

import { handleUnitGetAll, handleUnitMoved } from ".";
import { MessageType, ObjectType, SocketMessage, User } from "../../types";
import { handleClose } from "./close";
import { findPlayerById } from "../../db/queries";
import { verifyAccess } from "../../auth/jwt";
import { logger } from "../../logger";
import { CAMERA_DRIFT_SPEED, LOCATION_UPDATE_INTERVAL, IDLE_TIMEOUT_MS } from "../../config";

const AUTH_TIMEOUT_MS = 10_000;

const clientsSockets: { [key: string]: WebSocket } = {};
const users: { [key: string]: User } = {};

export function getOnlineIds(): string[] {
  return Object.keys(clientsSockets);
}

export function isOnline(id: string): boolean {
  return id in clientsSockets;
}

export function broadcast(message: SocketMessage, senderId?: string) {
  for (const key in clientsSockets) {
    if (senderId && key !== senderId) {
      clientsSockets[key].send(JSON.stringify(message));
    }
  }
}

export function handleConnection(ws: WebSocket) {
  logger.info("New WS connection — waiting for UNIT_AUTH");

  const timeout = setTimeout(() => {
    logger.warn("UNIT_AUTH timeout — closing connection");
    ws.close();
  }, AUTH_TIMEOUT_MS);

  ws.once("message", async function (raw: string) {
    clearTimeout(timeout);

    let message: SocketMessage;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      ws.close();
      return;
    }

    if (message.type !== MessageType.UNIT_AUTH) {
      ws.close();
      return;
    }

    const token = message.token as string | undefined;
    if (!token) {
      ws.send(JSON.stringify({ type: MessageType.AUTH_ERROR, srcId: "", payload: { error: "Token required" } }));
      ws.close();
      return;
    }

    const tokenPayload = verifyAccess(token);
    if (!tokenPayload) {
      ws.send(JSON.stringify({ type: MessageType.AUTH_ERROR, srcId: "", payload: { error: "Invalid or expired token" } }));
      ws.close();
      return;
    }

    const id = tokenPayload.id;
    const player = await findPlayerById(id);
    if (!player) {
      logger.warn("Unknown player id: " + id);
      ws.send(JSON.stringify({ type: MessageType.AUTH_ERROR, srcId: id, payload: { error: "Unknown player" } }));
      ws.close();
      return;
    }

    // If a socket for this player is already registered, close it silently.
    // handleClose will detect it's the old socket and skip the UNIT_DISCONNECTED broadcast.
    const existingSocket = clientsSockets[id];
    if (existingSocket && existingSocket !== ws) {
      logger.info(`Player ${id} reconnected — closing previous socket`);
      existingSocket.close();
    }

    users[id] = { id, type: player.unitType as ObjectType, coords: { lat: player.lastLat ?? 0, lon: player.lastLng ?? 0 } };
    clientsSockets[id] = ws;
    logger.info("Authenticated: " + id);

    ws.send(JSON.stringify({
      type: MessageType.UNIT_AUTHENTICATED,
      srcId: id,
      payload: { config: { cameraDriftSpeed: CAMERA_DRIFT_SPEED, locationUpdateInterval: LOCATION_UPDATE_INTERVAL } },
    }));

    broadcast({ type: MessageType.UNIT_CONNECTED, srcId: id }, id);

    // Idle timeout — close zombie connections that stop sending UNIT_MOVED
    let idleTimer = setTimeout(() => {
      logger.warn(`Idle timeout for ${id} — closing connection`);
      ws.close();
    }, IDLE_TIMEOUT_MS);

    ws.on("message", function (wsMessage: string) {
      logger.debug("Incoming message: " + wsMessage);

      let msg: SocketMessage;
      try {
        msg = JSON.parse(wsMessage.toString());
      } catch {
        return logger.error("Can't parse wsMessage");
      }

      switch (msg.type) {
        case MessageType.UNIT_GET_ALL:
          handleUnitGetAll(msg, clientsSockets[msg.srcId], users);
          break;
        case MessageType.UNIT_MOVED:
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            logger.warn(`Idle timeout for ${id} — closing connection`);
            ws.close();
          }, IDLE_TIMEOUT_MS);
          handleUnitMoved(msg, users);
          break;
      }
    });

    ws.on("close", function () {
      clearTimeout(idleTimer);
      handleClose(id, ws, clientsSockets, users);
    });
  });
}
