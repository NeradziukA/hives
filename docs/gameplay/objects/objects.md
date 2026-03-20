# Objects

**Static objects** are fixed-position game entities: buildings, bases, and landmarks. Unlike units, they do not move. They are stored in the `static_objects` table and broadcast to clients on connection.

---

## Data Model (`static_objects`)

| Field          | DB Column       | Type      | Required | Description                                           |
|----------------|-----------------|-----------|----------|-------------------------------------------------------|
| `id`           | `id`            | text PK   | yes      | Unique object identifier                              |
| `type`         | `type`          | text      | yes      | Building category — see `BuildingType` enum           |
| `name`         | `name`          | text      | no       | Display name                                          |
| `lat`          | `lat`           | float     | yes      | Geographic latitude                                   |
| `lng`          | `lng`           | float     | yes      | Geographic longitude                                  |
| `revealRadius` | `reveal_radius` | integer   | yes      | Radius (meters) that clears the fog of war            |
| `faction`      | `faction`       | text      | no       | Owning faction (`humans`, `zombies`, `neutral`)        |
| `capturedBy`   | `captured_by`   | text FK   | no       | Player ID of the last captor (→ `players.id`)         |
| `capturedAt`   | `captured_at`   | timestamp | no       | Timestamp of last capture                             |
| `active`       | `active`        | boolean   | yes      | Whether the object is active in the game world        |

---

## Building Types

Buildings are categorized by faction. The `BuildingType` enum covers both sides.

### Zombie Faction

| Value             | Description                                          |
|-------------------|------------------------------------------------------|
| `incubator`       | Zombie spawn point; anchors the Zombie Boss          |
| `hive`            | Zombie command structure; Alpha's home base          |
| `shelter-zombie`  | Safe zone for zombie units                           |
| `mutator`         | Research building; boosted by Zombie Scientist role  |
| `extractor`       | Resource extraction; boosted by Zombie Soldier role  |

### Human Faction

| Value              | Description                                           |
|--------------------|-------------------------------------------------------|
| `military-base`    | Human spawn point; anchors the Human Boss             |
| `resistance-base`  | Human command structure; General's home base          |
| `shelter-human`    | Safe zone for human units                             |
| `laboratory`       | Research building; boosted by Human Scientist role    |
| `training-base`    | Combat training; boosted by Human Soldier role        |

---

## WebSocket Representation

On connection, static objects are sent inside `INIT_UNITS` as a `StaticObject` array:

```typescript
type StaticObject = {
  id: string;
  type: BuildingType;
  coords: Coordinates; // { lat, lon } relative to the observer's origin
};
```

Only `id`, `type`, and `coords` are transmitted to the client. Capture state and reveal radius are server-side only.

---

## Fog of War

Each static object clears the fog of war within its `revealRadius` (metres) for members of the owning faction. A larger `revealRadius` means a wider revealed zone around the building.

`revealRadius` is configurable per building in the admin panel (**Buildings → Edit → Reveal Radius**).

See [vision.md](../calculations/vision.md) for the full fog-of-war model.

---

## Capture Mechanics

- Any building with a non-null `faction` can potentially be captured.
- On capture the server sets `capturedBy` and `capturedAt`, and updates `faction`.
- Territory control is also reflected in `hex_ownership` for the surrounding hexes.

---

## See Also

- [units.md](../units/units.md) — Unit hierarchy and data model
- [vision.md](../calculations/vision.md) — Fog of war and reveal radius
- [combat.md](../calculations/combat.md) — Combat formulas
