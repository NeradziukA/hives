import * as THREE from "three";
import { UnitModel } from "./models";
import { Coords } from "../../lib/geo/coords";
import LocationTracker from "./location";
import { handleUnitAuthenticated } from "./handlers/unitAuthenticatedHandler";
import { handleUnitConnected } from "./handlers/unitConnectedHandler";
import { handleUnitDisconnected } from "./handlers/unitDisconnectedHandler";
import { handleUnitMoved } from "./handlers/unitMovedHandler";
import { handleInitUnits } from "./handlers/initUnitsHandler";

let socket: WebSocket;
let myId: string;
const otherUnits: Map<string, UnitModel> = new Map();

export function connectWebSocket(
  scene: THREE.Scene,
  messageHandler: Function
): void {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//${window.location.hostname}:3000`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("Connected to server");
    socket.send(
      JSON.stringify({
        type: "UNIT_AUTH",
      })
    );
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket closed:", event.reason);
    setTimeout(() => connectWebSocket(scene, messageHandler), 5000);
  };

  socket.onmessage = (event: MessageEvent) => {
    messageHandler(
      event,
      scene,
      socket,
      otherUnits,
      (id: string) => (myId = id)
    );
  };
}

export async function handleWebSocketMessages(
  event: MessageEvent,
  scene: THREE.Scene,
  socket: WebSocket,
  otherUnits: Map<string, UnitModel>,
  setMyId: (id: string) => void
): Promise<void> {
  try {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case "UNIT_AUTHENTICATED":
        handleUnitAuthenticated(message, socket, setMyId);
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
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}
