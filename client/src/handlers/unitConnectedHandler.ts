import * as THREE from "three";
import { UnitModel } from "../models";
import { pushMessage } from "../ui/gameState.svelte.ts";

type UnitConnectedMessage = { srcId: string; payload?: { unitType?: string } };

export async function handleUnitConnected(
  message: UnitConnectedMessage,
  scene: THREE.Scene,
  otherUnits: Map<string, UnitModel>
): Promise<void> {
  if (message.srcId) {
    const unit = await UnitModel.create();
    unit.renderObj.userData.unitId = message.srcId;
    unit.renderObj.userData.objectType = message.payload?.unitType ?? 'unit';
    otherUnits.set(message.srcId, unit);
    scene.add(unit.renderObj!);
    pushMessage(`Unit ${message.srcId.slice(0, 6)} connected`);
  }
}
