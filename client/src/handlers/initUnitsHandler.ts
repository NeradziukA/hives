import * as THREE from "three";
import { UnitModel } from "../models";
import { Coords } from "../../../lib/geo/coords";

type StaticObjectInfo = { coords: Coords; revealRadius: number; faction?: string };
const staticObjectsMap = new Map<string, StaticObjectInfo>();
export function getStaticObjectsMap() { return staticObjectsMap; }

type InitUnitsMessage = {
  payload: {
    users?: Record<string, { type: string; coords: { lat: number; lon: number }; username?: string }>;
    staticObjects?: Array<{ id: string; type: string; coords: { lat: number; lon: number }; name?: string; revealRadius: number; faction?: string }>;
  };
};

export async function handleInitUnits(
  message: InitUnitsMessage,
  scene: THREE.Scene,
  otherUnits: Map<string, UnitModel>,
  myId: string
): Promise<void> {
  // Clear stale units from previous session before repopulating
  for (const unit of otherUnits.values()) {
    if (unit.renderObj) scene.remove(unit.renderObj);
  }
  otherUnits.clear();

  if (message.payload.users) {
    for (const [id, unitData] of Object.entries(message.payload.users)) {
      if (id !== myId.toString()) {
        const unit = await UnitModel.create();
        unit.renderObj.userData.unitId = id;
        unit.renderObj.userData.objectType = unitData.type;
        unit.renderObj.userData.username = unitData.username ?? null;
        unit.moveTo(new Coords(unitData.coords.lat, unitData.coords.lon));
        otherUnits.set(id, unit);
        scene.add(unit.renderObj);
      }
    }
  }
  staticObjectsMap.clear();
  if (message.payload.staticObjects) {
    for (const o of message.payload.staticObjects) {
      const unit = await UnitModel.create(false, "/assets/models-3d/Large Building.glb", 25);
      unit.renderObj.userData.unitId = o.id;
      unit.renderObj.userData.objectType = o.type;
      unit.renderObj.userData.username = o.name ?? null;
      unit.moveTo(new Coords(o.coords.lat, o.coords.lon));
      otherUnits.set(o.id, unit);
      scene.add(unit.renderObj);
      staticObjectsMap.set(o.id, {
        coords: new Coords(o.coords.lat, o.coords.lon),
        revealRadius: o.revealRadius,
        faction: o.faction,
      });
    }
  }
}
