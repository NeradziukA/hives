import { Coords } from "../../../lib/geo/coords";
import { UnitModel } from "../models";

type UnitMovedMessage = { srcId: string; payload: { coords: { lat: number; lon: number } } };

export function handleUnitMoved(
  message: UnitMovedMessage,
  otherUnits: Map<string, UnitModel>
): void {
  const movingUnit = otherUnits.get(message.srcId);
  if (movingUnit) {
    movingUnit.moveTo(
      new Coords(message.payload.coords.lat, message.payload.coords.lon)
    );
  }
}
