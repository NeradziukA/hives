import * as THREE from "three";
import { UnitModel } from "../models";
import { pushMessage } from "../ui/gameState.svelte.ts";

export async function handleUnitConnected(
  message: any,
  scene: THREE.Scene,
  otherUnits: Map<string, UnitModel>
): Promise<void> {
  if (message.srcId) {
    const unit = await UnitModel.create();
    unit.renderObj.userData.unitId = message.srcId;
    otherUnits.set(message.srcId, unit);
    scene.add(unit.renderObj!);
    pushMessage(`Unit ${message.srcId.slice(0, 6)} connected`);
  }
}
