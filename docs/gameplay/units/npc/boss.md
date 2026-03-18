# Boss

The Boss is a unique, immortal faction leader stored as a regular player row with `role = 'boss'`.

- **Faction** — `humans` or `zombies`
- **Immortality** — `isAlive` is never set to `false` by the combat system
- **Location** — Human Boss anchors to `military-base`; Zombie Boss anchors to `incubator`
- **Attributes** — set by server administrators via the admin panel

---

## See Also

- [npc.md](npc.md) — NPC types overview and shared attribute model
- [units.md](../units.md) — Unit data model and class hierarchy
