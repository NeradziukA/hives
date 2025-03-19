import { Damage } from "../damages";
import { Coords } from "../geo/coords";
import { DamageableI } from "../interfaces";
import { GeoObject } from "../geo/geo-object";

export class Trap extends GeoObject {
  damage: Damage;
  activateTrap(activator: DamageableI) {
    activator.applyDamage(this.damage);
  }
  constructor(coords: Coords, radius: number, damage: Damage) {
    super(coords, radius);
    this.damage = damage;
  }
}
