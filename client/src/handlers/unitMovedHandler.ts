import * as THREE from "three";
import { Coords } from "../../../lib/geo/coords";
import { UnitModel } from "../models";
import { getUnitMetaMap } from "./initUnitsHandler";

type UnitMovedMessage = { srcId: string; payload: { coords: { lat: number; lon: number } } };

export async function handleUnitMoved(
  message: UnitMovedMessage,
  otherUnits: Map<string, UnitModel>,
  scene?: THREE.Scene
): Promise<void> {
  let movingUnit = otherUnits.get(message.srcId);
  if (!movingUnit && scene) {
    const unit = await UnitModel.create();
    unit.renderObj.userData.unitId = message.srcId;
    otherUnits.set(message.srcId, unit);
    scene.add(unit.renderObj);
    movingUnit = unit;
  }
  if (movingUnit) {
    const coords = new Coords(message.payload.coords.lat, message.payload.coords.lon);
    movingUnit.moveTo(coords);
    const meta = getUnitMetaMap().get(message.srcId);
    if (meta) meta.coords = coords;
  }
}
