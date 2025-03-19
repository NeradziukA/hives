export enum DamageType {
  PHISYCAL = "phisycal",
}

export class Damage {
  type: DamageType;
  points: number;
}
