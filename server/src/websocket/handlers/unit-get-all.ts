import { WebSocket } from "ws";
import { MessageType, SocketMessage, UserList } from "../../types";
import { getStaticObjects } from "../../api";
import { getAlwaysOnlineNpcs } from "../../db/queries";

export async function handleUnitGetAll(
  message: SocketMessage,
  clientSocket: WebSocket,
  users: UserList
) {
  const [nearStaticObjects, alwaysOnlineNpcs] = await Promise.all([
    getStaticObjects(),
    getAlwaysOnlineNpcs(),
  ]);

  // Merge alwaysOnline NPCs from DB with in-memory users (in-memory takes precedence
  // for patrol NPCs whose positions are updated in real-time).
  const mergedUsers: UserList = { ...users };
  for (const npc of alwaysOnlineNpcs) {
    if (!(npc.id in mergedUsers)) {
      mergedUsers[npc.id] = {
        id: npc.id,
        type: npc.unitType,
        coords: { lat: npc.lastLat ?? 0, lon: npc.lastLng ?? 0 },
      };
    }
  }

  clientSocket.send(JSON.stringify({
    type: MessageType.INIT_UNITS,
    srcId: message.srcId,
    payload: {
      users: mergedUsers,
      staticObjects: nearStaticObjects,
    },
  }));
}
