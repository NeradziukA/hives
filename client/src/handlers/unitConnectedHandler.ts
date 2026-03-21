import * as THREE from "three";
import { UnitModel } from "../models";
import { pushMessage } from "../ui/gameState.svelte.ts";
import { getUnitMetaMap } from "./initUnitsHandler";
import { Coords } from "../../../lib/geo/coords";

type UnitConnectedMessage = { srcId: string; payload?: { unitType?: string; username?: string; faction?: string; visionRadius?: number } };

export async function handleUnitConnected(
  message: UnitConnectedMessage,
  scene: THREE.Scene,
  otherUnits: Map<string, UnitModel>
): Promise<void> {
  if (message.srcId) {
    const unit = await UnitModel.create();
    unit.renderObj.userData.unitId = message.srcId;
    unit.renderObj.userData.objectType = message.payload?.unitType ?? 'unit';
    unit.renderObj.userData.username = message.payload?.username ?? null;
    otherUnits.set(message.srcId, unit);
    scene.add(unit.renderObj!);
    getUnitMetaMap().set(message.srcId, {
      coords: new Coords(0, 0),
      faction: message.payload?.faction,
      visionRadius: message.payload?.visionRadius,
    });
    pushMessage(`Unit ${message.srcId.slice(0, 6)} connected`);
  }
}
