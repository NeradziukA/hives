import { WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import { handleConnection } from "./handlers/connect";

function setupWebSocket(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server });
  wss.on("connection", handleConnection);
  return wss;
}

export { setupWebSocket };
