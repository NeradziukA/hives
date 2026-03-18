# Patrol

Patrol NPCs are bot units that follow a server-defined waypoint route. Bots can belong to any faction (not just zombies). Their patrol data is stored in the **`npc_patrols`** table (separate from the `players` table).

---

## General

- Bots move along a predefined route at a configured speed.
- Bots are always online — they are never in an offline/inactive state.
- Bots can be selected in the UI for interaction. Available actions depend on the bot's type and faction.
- Bots participate in quests.

---

## `npc_patrols` Schema

| Field      | Type      | Description                                   |
|------------|-----------|-----------------------------------------------|
| `id`       | uuid PK   | Patrol record identifier                      |
| `npcId`    | text FK   | References `players.id` of the patrol NPC     |
| `speed`    | number    | Movement speed along the route (m/s)          |
| `waypoints`| jsonb     | Ordered array of `{ lat, lon, order }` points |
| `isActive` | boolean   | Whether the patrol is currently running       |
| `createdAt`| timestamp | Creation timestamp                            |

---

## Waypoint Structure

```typescript
Array<{ lat: number; lng: number; order: number }>
```

Waypoints are traversed in ascending `order`. The patrol loops when the last waypoint is reached.

---

## Server-Side Loop

Patrol movement is driven by `server/src/npc/patrol-loop.ts`, which runs a tick every **100 ms** (`NPC_TICK_INTERVAL_MS`).

On server startup:
1. `loadPatrols()` — queries all `npc_patrols` rows where `isActive = true`, reads the NPC's last known position from the `players` table, and populates the in-memory `patrolStates` map.
2. `loadStaticNpcs()` — loads `alwaysOnline` NPCs that have no patrol route and registers them in the `users` map so they are always included in `INIT_UNITS` responses.

Each tick:
- Advances every patrol's position toward the next waypoint using haversine distance and bearing calculations.
- When a waypoint is reached the patrol moves to the next one; after the last waypoint it loops back to the first.
- The new position is written to `players.lastLat / lastLng` in the database and broadcast to all connected clients as `UNIT_MOVED`.

```
patrolStates: Map<npcId, PatrolState>
PatrolState {
  waypoints: Array<{ lat, lng, order }>
  speed: number          // m/s
  currentLat / currentLng
  currentWaypointIndex
}
```

---

## UI Interaction

Bots can be selected in the game UI similarly to player units. The set of available actions shown upon selection depends on the bot's type and faction. Examples:

- Trade bots may offer a shop interface.
- Quest bots may trigger dialogue.
- Hostile bots may initiate combat.

---

## See Also

- [npc.md](npc.md) — NPC types overview and shared attribute model
- [units.md](../units.md) — Unit data model and class hierarchy
