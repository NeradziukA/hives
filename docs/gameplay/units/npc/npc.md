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

| `alwaysOnline` | Behaviour |
|----------------|-----------|
| `false`        | NPC is invisible to clients; `UNIT_MOVED` is never broadcast for this NPC |
| `true`         | NPC is included in every `INIT_UNITS` response and its position is broadcast via `UNIT_MOVED` |

**Stationary NPCs** (no active patrol) — fetched directly from the database on each `UNIT_GET_ALL` request when `alwaysOnline = true`.

**Patrol NPCs** (`npc_patrols` with `isActive = true`) — position is tracked in-memory every tick, but `UNIT_MOVED` is only broadcast and the NPC only appears in `INIT_UNITS` when `alwaysOnline = true`.

### Runtime toggle (admin panel)

Changing `alwaysOnline` via the admin panel takes effect immediately without a server restart:

- **`true → false`**: server broadcasts `UNIT_DISCONNECTED`; clients remove the NPC from the map. The patrol tick stops broadcasting for that NPC.
- **`false → true`**: server broadcasts `UNIT_MOVED` with the NPC's current position; clients add it to the map.

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
