import { Coords } from "../geo/coords";

export interface Unit<T> {
  obj: T;
  getModel(): T;
  moveTo(coords: Coords): void;
}
