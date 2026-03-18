export type Lang = 'en' | 'ru';

import { BuildingType, PlayerRank, PlayerRole, Faction, UnitType } from '../../../lib/enums.ts';
export { BuildingType, PlayerRank, PlayerRole, Faction, UnitType };

export interface Player {
  id: string;
  username: string;
  unitType: UnitType;
  faction: Faction;
  rank: PlayerRank;
  role: PlayerRole | null;
  isAlive: boolean;
  isOnline: boolean;
  hp: number; maxHp: number;
  lastLat: number | null; lastLng: number | null;
  lastSeen: string | null; createdAt: string | null;
  strength: number; defense: number; agility: number;
  speed: number; intelligence: number; leadership: number;
  vision: number; vaccineLevel: number; bagSize: number;
  mutation: number; heavyWeapon: number; twoHanded: number;
  camouflage: number; regeneration: number; stench: number;
}

export interface PlayerListResponse {
  users: Player[];
  total: number;
  page: number;
  limit: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  name: string | null;
  lat: number;
  lng: number;
  revealRadius: number;
  faction: Faction | null;
  capturedBy: string | null;
  capturedAt: string | null;
  active: boolean;
}

export interface SearchParams {
  q: string;
  lat: string;
  lng: string;
  radius: string;
}

export interface Waypoint {
  lat: number;
  lng: number;
  order: number;
}

export interface NpcPatrol {
  id: string;
  npcId: string | null;
  npcUsername: string | null;
  speed: number;
  waypoints: Waypoint[];
  isActive: boolean;
  createdAt: string | null;
}

export interface PatrolListResponse {
  patrols: NpcPatrol[];
  total: number;
  page: number;
  limit: number;
}
