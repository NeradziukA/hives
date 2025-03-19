import { Coords } from "../geo/coords";
import { GeoObject } from "../geo/geo-object";
import { DamageableI, MovableI } from "../interfaces";
import { Damage } from "../damages";

/**
 * Class Unit
 *
 * @implements DamageableI, MovableI
 */
export class Unit<T> extends GeoObject implements DamageableI, MovableI {
  renderObj: T;
  health: number;
  applyDamage(damage: Damage) {
    this.health = this.health - damage.points;
  }
  moveTo(coords: Coords) {
    this.coords = coords;
  }
  constructor(coords: Coords, radius: number, health: number) {
    super(coords, radius);
    this.health = health;
  }
}
