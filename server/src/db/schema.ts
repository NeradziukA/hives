import {
  pgTable, text, uuid, integer, doublePrecision,
  boolean, jsonb, timestamp, primaryKey,
} from 'drizzle-orm/pg-core'

export const players = pgTable('players', {
  id:           text('id').primaryKey(),
  username:     text('username').unique(),
  passwordHash: text('password_hash'),
  unitType: text('unit_type').notNull().default('HUMAN_A'),
  faction:  text('faction').notNull().default('humans'),
  role:     text('role'),

  strength:     integer('strength').default(10),
  defense:      integer('defense').default(10),
  agility:      integer('agility').default(10),
  speed:        integer('speed').default(10),
  intelligence: integer('intelligence').default(10),
  hp:           integer('hp').default(100),
  maxHp:        integer('max_hp').default(100),
  leadership:   integer('leadership').default(0),
  vision:       integer('vision').default(10),
  vaccineLevel: integer('vaccine_level').default(0),
  bagSize:      integer('bag_size').default(5),

  heavyWeapon:  integer('heavy_weapon').default(0),
  twoHanded:    integer('two_handed').default(0),
  camouflage:   integer('camouflage').default(0),
  regeneration: integer('regeneration').default(0),
  stench:       integer('stench').default(0),
  mutation:     integer('mutation').default(0),

  isAlive:    boolean('is_alive').default(true),
  respawnAt:  timestamp('respawn_at', { withTimezone: true }),
  infectedAt: timestamp('infected_at', { withTimezone: true }),

  lastLat:  doublePrecision('last_lat'),
  lastLng:  doublePrecision('last_lng'),
  lastSeen: timestamp('last_seen', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const staticObjects = pgTable('static_objects', {
  id:           text('id').primaryKey(),
  type:         text('type').notNull(),
  name:         text('name'),
  lat:          doublePrecision('lat').notNull(),
  lng:          doublePrecision('lng').notNull(),
  revealRadius: integer('reveal_radius').notNull(),
  faction:      text('faction'),
  capturedBy:   text('captured_by').references(() => players.id, { onDelete: 'set null' }),
  capturedAt:   timestamp('captured_at', { withTimezone: true }),
  active:       boolean('active').default(true),
})

export const inventory = pgTable('inventory', {
  id:         uuid('id').primaryKey().defaultRandom(),
  playerId:   text('player_id').references(() => players.id, { onDelete: 'cascade' }),
  itemType:   text('item_type').notNull(),
  itemData:   jsonb('item_data'),
  isEquipped: boolean('is_equipped').default(false),
  obtainedAt: timestamp('obtained_at', { withTimezone: true }).defaultNow(),
})

export const playerTracks = pgTable('player_tracks', {
  id:         uuid('id').primaryKey().defaultRandom(),
  playerId:   text('player_id').references(() => players.id, { onDelete: 'cascade' }),
  lat:        doublePrecision('lat').notNull(),
  lng:        doublePrecision('lng').notNull(),
  hexId:      text('hex_id'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow(),
})

export const hexVisited = pgTable('hex_visited', {
  playerId:   text('player_id').references(() => players.id, { onDelete: 'cascade' }),
  hexId:      text('hex_id').notNull(),
  firstVisit: timestamp('first_visit', { withTimezone: true }).defaultNow(),
  lastVisit:  timestamp('last_visit',  { withTimezone: true }).defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.playerId, t.hexId] }),
}))

export const hexOwnership = pgTable('hex_ownership', {
  hexId:      text('hex_id').primaryKey(),
  faction:    text('faction'),
  capturedAt: timestamp('captured_at', { withTimezone: true }).defaultNow(),
})

export const zombiePatrols = pgTable('zombie_patrols', {
  id:        uuid('id').primaryKey().defaultRandom(),
  zombieId:  text('zombie_id').references(() => players.id, { onDelete: 'cascade' }),
  waypoints: jsonb('waypoints').notNull().$type<Array<{ lat: number; lng: number; order: number }>>(),
  isActive:  boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const combatEvents = pgTable('combat_events', {
  id:            uuid('id').primaryKey().defaultRandom(),
  attackerId:    text('attacker_id').references(() => players.id, { onDelete: 'set null' }),
  defenderId:    text('defender_id').references(() => players.id, { onDelete: 'set null' }),
  hitChance:     integer('hit_chance'),
  damage:        integer('damage'),
  infectionRoll: boolean('infection_roll'),
  outcome:       text('outcome').notNull(),
  lat:           doublePrecision('lat'),
  lng:           doublePrecision('lng'),
  hexId:         text('hex_id'),
  occurredAt:    timestamp('occurred_at', { withTimezone: true }).defaultNow(),
})

export type Player        = typeof players.$inferSelect
export type NewPlayer     = typeof players.$inferInsert
export type StaticObject  = typeof staticObjects.$inferSelect
export type InventoryItem = typeof inventory.$inferSelect
export type PlayerTrack   = typeof playerTracks.$inferSelect
export type CombatEvent   = typeof combatEvents.$inferSelect
export type ZombiePatrol  = typeof zombiePatrols.$inferSelect
