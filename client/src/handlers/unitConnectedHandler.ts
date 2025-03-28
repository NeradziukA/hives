import * as THREE from "three";
import { UnitModel } from "../models";

export async function handleUnitConnected(
  message: any,
  scene: THREE.Scene,
  otherUnits: Map<string, UnitModel>
): Promise<void> {
  if (message.srcId) {
    const unit = await UnitModel.create();
    otherUnits.set(message.srcId, unit);
    scene.add(unit.renderObj!);
  }
}
