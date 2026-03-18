# Admin Panel

Svelte 5 admin UI for managing players and buildings. Source: [admin/src/](../../admin/src/)

## Build

```bash
cd admin && npm run build
```

Build runs `svelte-check --tsconfig ./tsconfig.json` before `vite build` — TypeScript errors block the build.
Output is written to `server/static/admin/`.

## Structure

```mermaid
graph TD
    App["App.svelte\nrouter · auth gate"]
    Sidebar["components/Sidebar.svelte\npage navigation"]

    subgraph Players["Players section"]
        PlayersPage["pages/PlayersPage.svelte\norchestrator"]
        SearchBar["PlayersSearchBar.svelte\nq · lat/lng/radius · online toggle"]
        PlayersTable["PlayersTable.svelte"]
        Pagination["PlayersPagination.svelte"]
        PlayerModal["dialogs/PlayerModal.svelte"]
        FormState["playerFormState.svelte.ts"]
        PlayerFormBase["PlayerFormBase.svelte\nrole → NPC / QUEST_MASTER / BOSS"]
        PlayerFormAttributes["PlayerFormAttributes.svelte"]
        PlayerFormSkills["PlayerFormSkills.svelte"]
    end

    subgraph Buildings["Buildings section"]
        BuildingsPage["pages/BuildingsPage.svelte\norchestrator"]
        BuildingsSearchBar["BuildingsSearchBar.svelte\nq · active toggle"]
        BuildingsTable["BuildingsTable.svelte"]
        BuildingModal["dialogs/BuildingModal.svelte"]
    end

    subgraph Patrols["Patrols section"]
        PatrolsPage["pages/PatrolsPage.svelte\norchestrator"]
        PatrolsTable["pages/PatrolsTable.svelte\nNPC · speed · waypoints · active"]
        PatrolModal["dialogs/PatrolModal.svelte\nNPC selector · speed · waypoints editor"]
    end

    ConfirmDialog["dialogs/ConfirmDialog.svelte\ndelete confirmation"]

    App --> Sidebar & PlayersPage & BuildingsPage & PatrolsPage
    PlayersPage --> SearchBar & PlayersTable & Pagination & PlayerModal & ConfirmDialog
    PlayerModal --> FormState & PlayerFormBase & PlayerFormAttributes & PlayerFormSkills
    BuildingsPage --> BuildingsSearchBar & BuildingsTable & Pagination & BuildingModal & ConfirmDialog
    PatrolsPage --> PatrolsTable & PatrolModal & ConfirmDialog
```

## NPC Creation

NPCs are not a separate section — they are players distinguished by their `role` field. The same `PlayerModal` dialog handles creation and editing for all player types, including NPCs.

**To create an NPC:**

1. Open the **Players** section from the sidebar
2. Click **+ New Player**
3. In the **Base** section, set **Role** to `NPC` (or `QUEST_MASTER` / `BOSS` for special subtypes)
4. Fill in username, password, unit type, faction, rank, HP, max HP
5. Configure attributes (`PlayerFormAttributes`) and skills (`PlayerFormSkills`)
6. Click **Save**

NPCs appear in the Players table alongside regular players. The search bar can filter by username; there is no role-specific filter.

> **Role field behavior:** the Role `<select>` has an empty option (`—`) as default, meaning newly created players have no role unless explicitly set. Setting Role to `NPC`, `QUEST_MASTER`, or `BOSS` is what distinguishes NPC-type units from human players.

## Components

| Component | Responsibility |
|---|---|
| `App.svelte` | Auth gate — shows `LoginDialog` until authenticated; routes to pages |
| `components/Sidebar.svelte` | Left nav (`<nav>` + `<ul>/<li>` + `<button>`), page links with `aria-current` |
| `pages/PlayersPage.svelte` | State owner: players list, pagination, search filters, modal/confirm state |
| `pages/PlayersSearchBar.svelte` | Search inputs (text, geo coords, radius) + online-only toggle + reset |
| `pages/PlayersTable.svelte` | Renders player rows; loading/empty states |
| `pages/PlayersPagination.svelte` | Prev/next buttons, page X/Y display, result range label |
| `pages/BuildingsPage.svelte` | State owner: buildings list, pagination, search filters, modal/confirm state |
| `pages/BuildingsSearchBar.svelte` | Search input (text) + active-only toggle + reset |
| `pages/BuildingsTable.svelte` | Renders building rows with edit/delete actions |
| `dialogs/PlayerModal.svelte` | Create/edit player modal; delegates form fields to sub-components |
| `dialogs/playerFormState.svelte.ts` | `PlayerFormState` interface, `FORM_DEFAULTS`, `populateForm(form, player)` |
| `dialogs/PlayerFormBase.svelte` | Base fields: username, password, unit type (`<select>`), faction (`<select>`), role (`<select>`), alive, HP |
| `dialogs/PlayerFormAttributes.svelte` | 10 attribute fields rendered via `{#each}` |
| `dialogs/PlayerFormSkills.svelte` | 5 skill fields rendered via `{#each}` |
| `dialogs/BuildingModal.svelte` | Create/edit building modal (type `<select>`, name, lat, lng, revealRadius, faction `<select>`, active) |
| `dialogs/ConfirmDialog.svelte` | Generic yes/no confirmation modal |
| `dialogs/LoginDialog.svelte` | Admin login form |
| `pages/PatrolsPage.svelte` | State owner: patrols list, pagination, active filter, modal/confirm state |
| `pages/PatrolsTable.svelte` | Renders patrol rows (NPC name, speed, waypoint count, active status, created date); edit/delete actions |
| `dialogs/PatrolModal.svelte` | Create/edit patrol modal; NPC selector, speed input, waypoints list editor (add/remove) |
| `lib/api.ts` | `apiFetch` (JWT header injection + auto-refresh), `safeJson` |
| `lib/auth.svelte.ts` | Token store, login/logout helpers |
| `lib/i18n.svelte.ts` | Admin UI strings (EN/RU) |
| `lib/toast.svelte.ts` | Toast notification state |
| `lib/types.ts` | `Player`, `Building`, `NpcPatrol` types |
| `components/ui/Spinner.svelte` | Loading spinner |
| `components/ui/Badge.svelte` | Status badge (faction / alive / online) |

## Enum-based Selects

All enum-valued fields use `<select>` elements populated from `lib/enums.ts` (imported via Vite's TypeScript handling). The displayed labels come from the i18n dictionaries in `lib/i18n.svelte.ts`.

| Field | Enum | Form component |
|---|---|---|
| Unit type | `UnitType` (`HUMAN_A`, `HUMAN_B`, `ZOMBIE_A`, `ZOMBIE_B`) | `PlayerFormBase.svelte` |
| Faction | `Faction` (`HUMANS`, `ZOMBIES`, `NEUTRAL`) | `PlayerFormBase.svelte` |
| Role | `PlayerRole` (`QUEST_MASTER`, `NPC`, `BOSS`) | `PlayerFormBase.svelte` |
| Rank | `PlayerRank` (`NOVICE`, `SURVIVOR`, `VETERAN`, `ELITE`, `GENERAL`) | `PlayerFormBase.svelte` |
| Building type | `BuildingType` (10 types) | `BuildingModal.svelte` |

`PlayerFormBase` iterates with `Object.values(UnitType)`, `Object.values(Faction)`, etc. Labels are looked up from the relevant i18n record (e.g. `unitTypes[value]`, `factions[value]`).

## i18n Enum Dictionaries

Each language file in `lib/i18n.svelte.ts` includes records mapping enum values to display strings:

| Record | Keys |
|---|---|
| `buildingTypes` | All 10 `BuildingType` values |
| `unitTypes` | All 4 `UnitType` values |
| `factions` | All 3 `Faction` values |
| `ranks` | All 5 `PlayerRank` values |
| `roles` | All 3 `PlayerRole` values |

Supported locales: **EN**, **RU**.

## API

### Players

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/api/users` | List with pagination and filters |
| `GET` | `/admin/api/users/:id` | Single player |
| `POST` | `/admin/api/users` | Create player |
| `PUT` | `/admin/api/users/:id` | Update player |
| `DELETE` | `/admin/api/users/:id` | Delete player |

Query params for `GET /admin/api/users`: `page`, `limit`, `q`, `lat`, `lng`, `radius`, `online`

### Buildings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/api/buildings` | List with pagination and filters |
| `POST` | `/admin/api/buildings` | Create building |
| `PUT` | `/admin/api/buildings/:id` | Update building |
| `DELETE` | `/admin/api/buildings/:id` | Delete building |

Query params for `GET /admin/api/buildings`: `page`, `limit`, `q`, `active`

### Patrols

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/api/patrols` | List with pagination and filters |
| `GET` | `/admin/api/patrols/:id` | Single patrol |
| `POST` | `/admin/api/patrols` | Create patrol |
| `PUT` | `/admin/api/patrols/:id` | Update patrol |
| `DELETE` | `/admin/api/patrols/:id` | Delete patrol |

Query params for `GET /admin/api/patrols`: `page`, `limit`, `active`

## Semantic markup

- `<nav>` contains `<ul role="list">` / `<li>` / `<button>` — no `<div role="button">` anti-patterns
- Active nav item has `aria-current="page"`
- Decorative icons have `aria-hidden="true"`
- Lang toggle buttons have `aria-pressed`
- Sidebar header/footer use `<header>` / `<footer>`
