import type { Player } from '../lib/types.ts';
import { PlayerRank, Faction, UnitType } from '../lib/types.ts';

export interface PlayerFormState {
  username: string;
  password: string;
  unitType: UnitType;
  faction: Faction;
  rank: PlayerRank;
  role: string;
  isAlive: string;
  alwaysOnline: boolean;
  hp: number;
  maxHp: number;
  strength: number;
  defense: number;
  agility: number;
  speed: number;
  intelligence: number;
  leadership: number;
  vision: number;
  vaccineLevel: number;
  bagSize: number;
  mutation: number;
  heavyWeapon: number;
  twoHanded: number;
  camouflage: number;
  regeneration: number;
  stench: number;
}

export const FORM_DEFAULTS: PlayerFormState = {
  username: '', password: '', unitType: UnitType.HUMAN_A, faction: Faction.HUMANS,
  rank: PlayerRank.NOVICE, role: '', isAlive: 'true', alwaysOnline: false, hp: 100, maxHp: 100, strength: 10,
  defense: 10, agility: 10, speed: 10, intelligence: 10, leadership: 0,
  vision: 10, vaccineLevel: 0, bagSize: 5, mutation: 0,
  heavyWeapon: 0, twoHanded: 0, camouflage: 0, regeneration: 0, stench: 0,
};

export function populateForm(form: PlayerFormState, p: Player): void {
  form.username    = p.username    ?? '';
  form.password    = '';
  form.unitType    = p.unitType    ?? UnitType.HUMAN_A;
  form.faction     = p.faction     ?? Faction.HUMANS;
  form.rank        = p.rank        ?? PlayerRank.NOVICE;
  form.role        = p.role        ?? '';
  form.isAlive      = p.isAlive !== false ? 'true' : 'false';
  form.alwaysOnline = p.alwaysOnline ?? false;
  form.hp           = p.hp ?? 100;
  form.maxHp       = p.maxHp       ?? 100;
  form.strength    = p.strength    ?? 10;
  form.defense     = p.defense     ?? 10;
  form.agility     = p.agility     ?? 10;
  form.speed       = p.speed       ?? 10;
  form.intelligence = p.intelligence ?? 10;
  form.leadership  = p.leadership  ?? 0;
  form.vision      = p.vision      ?? 10;
  form.vaccineLevel = p.vaccineLevel ?? 0;
  form.bagSize     = p.bagSize     ?? 5;
  form.mutation    = p.mutation    ?? 0;
  form.heavyWeapon = p.heavyWeapon ?? 0;
  form.twoHanded   = p.twoHanded   ?? 0;
  form.camouflage  = p.camouflage  ?? 0;
  form.regeneration = p.regeneration ?? 0;
  form.stench      = p.stench      ?? 0;
}
