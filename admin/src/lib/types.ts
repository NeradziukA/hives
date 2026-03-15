export type Lang = 'en' | 'ru';

export interface Player {
  id: string;
  username: string;
  unitType: string;
  faction: string;
  role: string | null;
  isAlive: boolean;
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

export interface SearchParams {
  q: string;
  lat: string;
  lng: string;
  radius: string;
}
