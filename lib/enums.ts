export enum BuildingType {
  // Zombie side
  INCUBATOR      = 'incubator',
  HIVE           = 'hive',
  SHELTER_ZOMBIE = 'shelter-zombie',
  MUTATOR        = 'mutator',
  EXTRACTOR      = 'extractor',
  // Human side
  MILITARY_BASE    = 'military-base',
  RESISTANCE_BASE  = 'resistance-base',
  SHELTER_HUMAN    = 'shelter-human',
  LABORATORY       = 'laboratory',
  TRAINING_BASE    = 'training-base',
}

export enum PlayerRank {
  NOVICE   = 'novice',
  SURVIVOR = 'survivor',
  VETERAN  = 'veteran',
  ELITE    = 'elite',
  GENERAL  = 'general',  // Alpha for zombies
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
