# Patrol

Patrol NPCs are zombie units that follow a server-defined waypoint route. Their patrol data is stored in the **`zombie_patrols`** table (separate from the `players` table).

---

## `zombie_patrols` Schema

| Field       | Type      | Description                                      |
|-------------|-----------|--------------------------------------------------|
| `id`        | uuid PK   | Patrol record identifier                         |
| `zombieId`  | text FK   | References `players.id` of the patrol NPC        |
| `waypoints` | jsonb     | Ordered array of `{ lat, lon, order }` points    |
| `isActive`  | boolean   | Whether the patrol is currently running          |
| `createdAt` | timestamp | Creation timestamp                               |

---

## Waypoint Structure

```typescript
Array<{ lat: number; lng: number; order: number }>
```

Waypoints are traversed in ascending `order`. The patrol loops when the last waypoint is reached.

---

## See Also

- [npc.md](npc.md) — NPC types overview and shared attribute model
- [units.md](../units.md) — Unit data model and class hierarchy
