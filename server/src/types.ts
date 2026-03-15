export enum MessageType {
  INIT_UNITS = "INIT_UNITS",
  UNIT_AUTH = "UNIT_AUTH",
  UNIT_AUTHENTICATED = "UNIT_AUTHENTICATED",
  AUTH_ERROR = "AUTH_ERROR",
  UNIT_CONNECTED = "UNIT_CONNECTED",
  UNIT_DISCONNECTED = "UNIT_DISCONNECTED",
  UNIT_GET_ALL = "UNIT_GET_ALL",
  UNIT_MOVED = "UNIT_MOVED",
}

export enum BuildingType {
  INCUBATOR       = 'incubator',
  HIVE            = 'hive',
  SHELTER_ZOMBIE  = 'shelter-zombie',
  MUTATOR         = 'mutator',
  EXTRACTOR       = 'extractor',
  MILITARY_BASE   = 'military-base',
  RESISTANCE_BASE = 'resistance-base',
  SHELTER_HUMAN   = 'shelter-human',
  LABORATORY      = 'laboratory',
  TRAINING_BASE   = 'training-base',
}

export enum PlayerRank {
  NOVICE   = 'novice',
  SURVIVOR = 'survivor',
  VETERAN  = 'veteran',
  ELITE    = 'elite',
  GENERAL  = 'general',
}

export enum PlayerRole {
  QUEST_MASTER = 'quest_master',
  NPC          = 'npc',
  BOSS         = 'boss',
}

export enum UnitType {
  HUMAN_A  = 'HUMAN_A',
  HUMAN_B  = 'HUMAN_B',
  ZOMBIE_A = 'ZOMBIE_A',
  ZOMBIE_B = 'ZOMBIE_B',
}

export enum Faction {
  HUMANS  = 'humans',
  ZOMBIES = 'zombies',
  NEUTRAL = 'neutral',
}

export enum ObjectType {
  ZOMBI_A    = "zombi-a",
  BUILDING_A = "building-a",
}

export type User = {
  id: string;
  type: UnitType;
  coords: Coordinates;
};

export type UserList = { [key: string]: User };

export type StaticObject = {
  id: string;
  type: BuildingType;
  coords: Coordinates;
};

export type Coordinates = {
  lat: number;
  lon: number;
};

export type GameConfig = {
  cameraDriftSpeed: number;
  locationUpdateInterval: number;
};

export type SocketMessage = {
  type: MessageType;
  srcId: string;
  token?: string;
  payload?: {
    coords?: Coordinates;
    users?: UserList;
    staticObjects?: StaticObject[];
    config?: GameConfig;
    error?: string;
    unitType?: string;
  };
};
