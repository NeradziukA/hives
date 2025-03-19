import { Coords } from "./coords";

export class GeoObject {
  coords: Coords;
  radius: number;
  isOverlaped(coords: Coords) {
    return false; // TODO
  }
  constructor(coords: Coords, radius: number) {
    this.coords = coords;
    this.radius = radius;
  }
}
