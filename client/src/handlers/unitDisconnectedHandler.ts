import * as THREE from "three";
import { UnitModel } from "../models";

export function handleUnitDisconnected(
  message: any,
  scene: THREE.Scene,
  otherUnits: Map<string, UnitModel>
): void {
  const unitToRemove = otherUnits.get(message.srcId);
  if (unitToRemove) {
    scene.remove(unitToRemove.renderObj!);
    otherUnits.delete(message.srcId);
  }
}
