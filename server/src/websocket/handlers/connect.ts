import { WebSocket } from "ws";

import { handleUnitGetAll, handleUnitMoved } from ".";
import { MessageType, SocketMessage, User } from "../../types";
import { handleClose } from "./close";
import { getUser } from "../../api";

// TODO move to DB
const clientsSockets: { [key: string]: WebSocket } = {};
const users: { [key: string]: User } = {};

export function broadcast(message: SocketMessage, senderId?: string) {
  for (const key in clientsSockets) {
    if (!senderId || key !== senderId) {
      clientsSockets[key].send(JSON.stringify(message));
    }
  }
}

export function handleConnection(ws: WebSocket) {
  const user = getUser();
  const id = user.id;
  users[id] = user;
  clientsSockets[id] = ws;
  console.log("New connection: " + id);

  let message: SocketMessage = {
    type: MessageType.UNIT_AUTHENTICATED,
    srcId: id,
  };

  ws.send(JSON.stringify(message));

  message = {
    type: MessageType.UNIT_CONNECTED,
    srcId: id,
  };

  broadcast(message, id);

  ws.on("message", function (wsMessage: string) {
    console.log("Incoming message: " + wsMessage);

    let message: SocketMessage;
    try {
      message = JSON.parse(wsMessage.toString());
    } catch (e) {
      return console.error("Can't parse wsMessage");
    }

    switch (message.type) {
      case MessageType.UNIT_GET_ALL: {
        handleUnitGetAll(message, clientsSockets[message.srcId], users);
        break;
      }

      case MessageType.UNIT_MOVED: {
        handleUnitMoved(message);
        break;
      }
    }
  });

  ws.on("close", function () {
    handleClose(id, clientsSockets, users);
  });
}
