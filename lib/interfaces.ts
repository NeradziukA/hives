import { Damage } from "./damages";
import { Coords } from "./geo/coords";

export interface DamageableI {
  health: number;
  applyDamage(damage: Damage): void;
}

export interface MovableI {
  coords: Coords;
  moveTo(coords: Coords): void;
}
