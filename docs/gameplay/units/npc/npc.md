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

Exact values are set by administrators. See [units.md § Unit Data Model](../units.md#unit-data-model) for the full column reference.

---

## Always-Online Flag

Every NPC has an `alwaysOnline` boolean column in the `players` table (default `false`).

When `alwaysOnline = true` the server registers the NPC in the shared `users` map at startup, so it always appears in `INIT_UNITS` responses sent to connecting clients — even if no player is near and even if the NPC has no patrol.

| `alwaysOnline` | Behaviour |
|----------------|-----------|
| `false`        | NPC is invisible to clients unless explicitly placed in the users map by game logic |
| `true`         | NPC appears in every `INIT_UNITS` response from the moment the server starts |

Patrol NPCs (`npc_patrols` with `isActive = true`) are always registered regardless of this flag; `alwaysOnline` is primarily useful for stationary NPCs such as quest masters and bosses.

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

## Subsections

| Document | Description |
|----------|-------------|
| [boss.md](boss.md) | Immortal faction leader |
| [quest-master.md](quest-master.md) | Quest-generating NPC |
| [patrol.md](patrol.md) | Zombie patrol following waypoints |

---

## See Also

- [units.md](../units.md) — Unit data model and class hierarchy
- [player/players.md](../player/players.md) — Human-controlled player reference
- [player/zombie.md](../player/zombie.md) — Zombie attributes and transformation
