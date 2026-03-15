import * as THREE from "three";
import { UnitModel } from "./models";
import { handleUnitAuthenticated } from "./handlers/unitAuthenticatedHandler";
import { handleUnitConnected } from "./handlers/unitConnectedHandler";
import { handleUnitDisconnected } from "./handlers/unitDisconnectedHandler";
import { handleUnitMoved } from "./handlers/unitMovedHandler";
import { handleInitUnits } from "./handlers/initUnitsHandler";

let socket: WebSocket | null = null;
let myId: string;
const otherUnits: Map<string, UnitModel> = new Map();

export function disconnectWebSocket(): void {
  if (socket) {
    socket.onclose = null; // prevent auto-reconnect
    socket.close();
    socket = null;
  }
}

export function connectWebSocket(
  playerId: string,
  accessToken: string,
  scene: THREE.Scene,
  messageHandler: (event: MessageEvent, scene: THREE.Scene, socket: WebSocket, otherUnits: Map<string, UnitModel>, setMyId: (id: string) => void, onOwnMove?: (coords: { lat: number; lon: number }) => void) => Promise<void> | void,
  onOwnMove?: (coords: { lat: number; lon: number }) => void
): void {
  disconnectWebSocket();
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsPort = window.location.port === "5173" ? ":3000"
    : window.location.port ? `:${window.location.port}` : "";
  const wsUrl = `${wsProtocol}//${window.location.hostname}${wsPort}`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("Connected to server, authenticating...");
    socket.send(JSON.stringify({ type: "UNIT_AUTH", srcId: playerId, token: accessToken }));
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket closed:", event.reason);
    setTimeout(() => connectWebSocket(playerId, accessToken, scene, messageHandler, onOwnMove), 5000);
  };

  socket.onmessage = (event: MessageEvent) => {
    messageHandler(
      event,
      scene,
      socket,
      otherUnits,
      (id: string) => (myId = id),
      onOwnMove
    );
  };
}

export function tickAllUnits(speed: number, camera?: THREE.PerspectiveCamera, screenHeight?: number): void {
  otherUnits.forEach((unit) => unit.tick(speed, camera, screenHeight));
}

export function getOtherUnitObjects(): THREE.Object3D[] {
  return Array.from(otherUnits.values())
    .map((u) => u.renderObj)
    .filter((obj): obj is THREE.Group => obj !== null);
}

export function getUnitById(id: string): import("./models").UnitModel | null {
  return otherUnits.get(id) ?? null;
}

export async function handleWebSocketMessages(
  event: MessageEvent,
  scene: THREE.Scene,
  socket: WebSocket,
  otherUnits: Map<string, UnitModel>,
  setMyId: (id: string) => void,
  onOwnMove?: (coords: { lat: number; lon: number }) => void
): Promise<void> {
  try {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case "UNIT_AUTHENTICATED":
        handleUnitAuthenticated(message, socket, setMyId, onOwnMove);
        break;

      case "UNIT_CONNECTED":
        await handleUnitConnected(message, scene, otherUnits);
        break;

      case "UNIT_DISCONNECTED":
        handleUnitDisconnected(message, scene, otherUnits);
        break;

      case "UNIT_MOVED":
        handleUnitMoved(message, otherUnits);
        break;

      case "INIT_UNITS":
        await handleInitUnits(message, scene, otherUnits, myId);
        break;

      case "AUTH_ERROR":
        console.error("Auth error:", message.payload?.error);
        break;
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}
