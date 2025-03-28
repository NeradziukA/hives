import { Coords } from "../../../lib/geo/coords";
import { UnitModel } from "../models";

export function handleUnitMoved(
  message: any,
  otherUnits: Map<string, UnitModel>
): void {
  const movingUnit = otherUnits.get(message.srcId);
  if (movingUnit) {
    movingUnit.moveTo(
      new Coords(message.payload.coords.lat, message.payload.coords.lon)
    );
  }
}
