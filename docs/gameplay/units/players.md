# Players

A **player** is a human-controlled unit. The `role` column is `null` for all player accounts.

Players belong to one of two factions and progress through ranks by gaining experience and equipment.

---

## Factions

| Faction    | Unit types              | Starting rank | Docs |
|------------|-------------------------|---------------|------|
| `humans`   | `HUMAN_A`, `HUMAN_B`   | `novice`      | [human.md](human.md) |
| `zombies`  | `ZOMBIE_A`, `ZOMBIE_B` | `novice`      | [zombie.md](zombie.md) |

Players may switch faction through the **Transformation** mechanic (human → zombie only). See [zombie.md § Transformation](zombie.md#трансформация).

---

## Rank Progression

| Rank       | Notes                             |
|------------|-----------------------------------|
| `novice`   | Default starting rank             |
| `survivor` | —                                 |
| `veteran`  | —                                 |
| `elite`    | —                                 |
| `general`  | Maximum rank; called Alpha for zombies |

---

## Inventory

Items are stored in the `inventory` table, linked to the player by `player_id`. The number of available slots equals `bagSize` (default 5).

| Field       | Description                                |
|-------------|--------------------------------------------|
| `itemType`  | Item category (text key)                   |
| `itemData`  | JSON payload with item-specific properties |
| `isEquipped`| Whether the item is currently active       |
| `obtainedAt`| Acquisition timestamp                      |

---

## Movement Tracking

Every position update is appended to the `player_tracks` table.

| Field        | Description                         |
|--------------|-------------------------------------|
| `lat`, `lng` | Geographic coordinates              |
| `hexId`      | H3 hex cell identifier              |
| `recordedAt` | Timestamp of the recorded position  |

Visited hexes are also recorded in `hex_visited` (first/last visit timestamps) and contribute to `hex_ownership` for faction territory control.

---

## Authentication

Players authenticate via JWT:

- **Access token** — 15-minute lifetime, sent with every request.
- **Refresh token** — 7-day lifetime, stored in `localStorage`.
- Credentials (`passwordHash`) are stored in the `players` row.

---

## See Also

- [human.md](human.md) — full Human attribute and skill reference
- [zombie.md](zombie.md) — full Zombie attribute, skill, and transformation reference
- [units.md](units.md) — shared Unit data model and class hierarchy
