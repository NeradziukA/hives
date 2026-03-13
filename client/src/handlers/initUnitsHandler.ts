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
  if (message.payload.staticObjects) {
    for (const o of message.payload.staticObjects) {
      const unit = await UnitModel.create(false, "Large Building.glb", 25);
      unit.moveTo(
        new Coords(
          (o as { coords: { lat: number; lon: number } }).coords.lat,
          (o as { coords: { lat: number; lon: number } }).coords.lon
        )
      );
      otherUnits.set(o.id, unit);
      scene.add(unit.renderObj);
    }
  }
}
