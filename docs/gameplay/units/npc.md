# NPC

An **NPC** (Non-Player Character) is a server-controlled unit. NPCs reuse the `players` table and share the same attribute model as regular players, but are distinguished by a non-null `role` column.

---

## NPC Types

| `role`          | `faction`  | Immortal | Description                                         |
|-----------------|------------|----------|-----------------------------------------------------|
| `npc`           | any        | no       | Generic server-controlled unit                      |
| `quest_master`  | any        | no       | Generates quests for allied units within range      |
| `boss`          | any        | **yes**  | Immortal faction leader; cannot be permanently killed |

---

## Boss

The Boss is a unique, immortal faction leader stored as a regular player row with `role = 'boss'`.

- **Faction** — `humans` or `zombies`
- **Immortality** — `isAlive` is never set to `false` by the combat system
- **Location** — Human Boss anchors to `military-base`; Zombie Boss anchors to `incubator`
- **Attributes** — set by server administrators via the admin panel

---

## Quest Master

A Quest Master is a named NPC (`role = 'quest_master'`) that generates quests for nearby allies.

- Can belong to any faction
- Positioned at a static base or building
- Quest radius is determined by server configuration

---

## Zombie Patrols

Patrol NPCs are zombie units that follow a server-defined waypoint route. Their patrol data is stored in the **`zombie_patrols`** table (separate from the `players` table).

### `zombie_patrols` Schema

| Field       | Type      | Description                                      |
|-------------|-----------|--------------------------------------------------|
| `id`        | uuid PK   | Patrol record identifier                         |
| `zombieId`  | text FK   | References `players.id` of the patrol NPC        |
| `waypoints` | jsonb     | Ordered array of `{ lat, lon, order }` points    |
| `isActive`  | boolean   | Whether the patrol is currently running          |
| `createdAt` | timestamp | Creation timestamp                               |

### Waypoint Structure

```typescript
Array<{ lat: number; lng: number; order: number }>
```

Waypoints are traversed in ascending `order`. The patrol loops when the last waypoint is reached.

---

## Shared Attribute Model

NPCs use the same columns as players. Typical server defaults:

| Attribute      | Generic NPC | Quest Master | Boss   |
|----------------|-------------|--------------|--------|
| `strength`     | 10          | 5            | 50+    |
| `defense`      | 10          | 5            | 50+    |
| `agility`      | 10          | 5            | 50+    |
| `hp` / `maxHp` | 100         | 50           | 500+   |
| `isAlive`      | true        | true         | always true |
| `vision`       | 10          | 10           | 20+    |

Exact values are set by administrators. See [units.md § Unit Data Model](units.md#unit-data-model) for the full column reference.

---

## WebSocket Visibility

NPCs are transmitted to clients as standard `User` objects:

```typescript
type User = {
  id: string;
  type: UnitType;   // e.g. ZOMBIE_A for patrol zombies
  coords: Coordinates;
};
```

The client renders NPCs identically to player units; the HUD `objectType` field distinguishes them visually when selected.

---

## See Also

- [units.md](units.md) — Unit data model and class hierarchy
- [players.md](players.md) — Human-controlled player reference
- [zombie.md](zombie.md) — Zombie attributes and transformation
