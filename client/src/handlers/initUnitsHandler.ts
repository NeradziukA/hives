import * as THREE from "three";
import { UnitModel } from "../models";
import { Coords } from "../../../lib/geo/coords";

export async function handleInitUnits(
  message: any,
  scene: THREE.Scene,
  otherUnits: Map<string, UnitModel>,
  myId: string
): Promise<void> {
  if (message.payload.users) {
    for (const [id, unitData] of Object.entries(message.payload.users)) {
      if (id !== myId.toString()) {
        const unit = await UnitModel.create();
        unit.moveTo(
          new Coords(
            (unitData as { coords: { lat: number; lon: number } }).coords.lat,
            (unitData as { coords: { lat: number; lon: number } }).coords.lon
          )
        );
        otherUnits.set(id, unit);
        scene.add(unit.renderObj);
      }
    }
  }
}
