# Units

A **unit** is any entity that occupies a position in the game world. Units share a common data model (the `players` table) and are differentiated by `faction`, `unitType`, and `role`.

---

## Class Hierarchy

```
Unit
├── Player          — human-controlled account
│   ├── Human       — faction: humans  |  unitType: HUMAN_A | HUMAN_B
│   └── Zombie      — faction: zombies |  unitType: ZOMBIE_A | ZOMBIE_B
└── NPC             — server-controlled entity  (role ≠ null)
    ├── Quest Master — role: quest_master
    ├── Boss         — role: boss  (immortal faction leader)
    └── Patrol       — zombie_patrols table, follows waypoints
```

---

## Unit Data Model

All units are stored in the `players` table.

### Identity & Classification

| Field      | Type     | Default    | Description                                      |
|------------|----------|------------|--------------------------------------------------|
| `id`       | text PK  | —          | Unique unit identifier                           |
| `username` | text     | —          | Display name (unique; null for server NPCs)      |
| `unitType` | text     | `HUMAN_A`  | Visual model — see `UnitType` enum               |
| `faction`  | text     | `humans`   | Faction membership — see `Faction` enum          |
| `rank`     | text     | `novice`   | Progression rank — see `PlayerRank` enum         |
| `role`     | text     | null       | Special server role — see `PlayerRole` enum      |

### Enums

**`UnitType`**

| Value      | Description          |
|------------|----------------------|
| `HUMAN_A`  | Human model variant A |
| `HUMAN_B`  | Human model variant B |
| `ZOMBIE_A` | Zombie model variant A |
| `ZOMBIE_B` | Zombie model variant B |

**`Faction`**

| Value     | Description             |
|-----------|-------------------------|
| `humans`  | Human resistance faction |
| `zombies` | Zombie horde faction     |
| `neutral` | No faction affiliation   |

**`PlayerRank`**

| Value      | Description                          |
|------------|--------------------------------------|
| `novice`   | Starting rank                        |
| `survivor` | First progression milestone          |
| `veteran`  | Mid-tier rank                        |
| `elite`    | High-tier rank                       |
| `general`  | Maximum rank (Alpha for zombies)     |

**`PlayerRole`** (NPC-only; `null` for regular players)

| Value          | Description                                    |
|----------------|------------------------------------------------|
| `npc`          | Generic server-controlled unit                 |
| `boss`         | Immortal faction leader                        |
| `quest_master` | Generates quests for allies within range       |

---

### Combat Attributes

All integer fields, default `10` unless noted.

| Field         | DB Column       | Default | Description                                      |
|---------------|-----------------|---------|--------------------------------------------------|
| `strength`    | `strength`      | 10      | Base melee damage → [combat](../calculations/combat.md) |
| `defense`     | `defense`       | 10      | Incoming damage reduction → [combat](../calculations/combat.md) |
| `agility`     | `agility`       | 10      | Hit / dodge chance → [combat](../calculations/combat.md) |
| `speed`       | `speed`         | 10      | Movement and escape chance                       |
| `intelligence`| `intelligence`  | 10      | Intel freshness (LKP delay) → [vision](../calculations/vision.md) |
| `hp`          | `hp`            | 100     | Current hit points                               |
| `maxHp`       | `max_hp`        | 100     | Maximum hit points                               |
| `leadership`  | `leadership`    | 0       | Group/swarm vision bonus → [vision](../calculations/vision.md) |
| `vision`      | `vision`        | 10      | Personal vision radius → [vision](../calculations/vision.md) |
| `vaccineLevel`| `vaccine_level` | 0       | Infection resistance (humans)                    |
| `bagSize`     | `bag_size`      | 5       | Inventory slot count                             |

### Skills

All integer fields, default `0`.

| Field          | DB Column      | Faction  | Description                                            |
|----------------|----------------|----------|--------------------------------------------------------|
| `heavyWeapon`  | `heavy_weapon` | humans   | Bonus damage with heavy weapons                        |
| `twoHanded`    | `two_handed`   | both     | Bonus damage and accuracy in melee                     |
| `camouflage`   | `camouflage`   | humans   | Reduces detection radius                               |
| `regeneration` | `regeneration` | both     | Speeds HP recovery after combat                        |
| `stench`       | `stench`       | zombies  | Reveals humans nearby; negates Camouflage              |
| `mutation`     | `mutation`     | zombies  | Infection strength on attack                           |

### Status & Position

| Field        | DB Column     | Description                                        |
|--------------|---------------|----------------------------------------------------|
| `isAlive`    | `is_alive`    | Whether the unit is alive (false = respawning)     |
| `respawnAt`  | `respawn_at`  | Timestamp when the unit returns from death         |
| `infectedAt` | `infected_at` | Timestamp of infection (triggers transformation)   |
| `lastLat`    | `last_lat`    | Last known latitude                                |
| `lastLng`    | `last_lng`    | Last known longitude                               |
| `lastSeen`   | `last_seen`   | Timestamp of last position update                  |
| `createdAt`  | `created_at`  | Account creation timestamp                         |

---

## WebSocket Representation

When transmitted over WebSocket the unit is a lightweight `User` object:

```typescript
type User = {
  id: string;       // unit identifier
  type: UnitType;   // visual model
  coords: Coordinates; // { lat, lon } relative to observer origin
};
```

The full attribute set is only loaded server-side or via the REST/admin API.

---

## Subsections

| Document | Description |
|----------|-------------|
| [player/players.md](player/players.md) | Human-controlled accounts — humans and zombies |
| [player/human.md](player/human.md) | Human faction attributes, skills, roles, combat outcomes |
| [player/zombie.md](player/zombie.md) | Zombie faction attributes, skills, roles, transformation |
| [npc/npc.md](npc/npc.md) | Server-controlled entities — bosses, quest masters, patrols |
| [npc/boss.md](npc/boss.md) | Immortal faction leader |
| [npc/quest-master.md](npc/quest-master.md) | Quest-generating NPC |
| [npc/patrol.md](npc/patrol.md) | Zombie patrol following waypoints |
