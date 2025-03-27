import { Server, WebSocket } from "ws";
import { Server as HttpServer } from "http";
import { handleConnection } from "./handlers/connect";

function setupWebSocket(server: HttpServer): Server {
  const wss = new Server({ server });
  wss.on("connection", handleConnection);
  return wss;
}

export { setupWebSocket };
