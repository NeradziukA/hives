import * as THREE from "three";
import { UnitModel } from "../models";
import { pushMessage } from "../ui/gameState.svelte.ts";

export function handleUnitDisconnected(
  message: any,
  scene: THREE.Scene,
  otherUnits: Map<string, UnitModel>
): void {
  const unitToRemove = otherUnits.get(message.srcId);
  if (unitToRemove) {
    scene.remove(unitToRemove.renderObj!);
    otherUnits.delete(message.srcId);
    pushMessage(`Unit ${message.srcId.slice(0, 6)} disconnected`);
  }
}
