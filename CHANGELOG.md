# Changelog

All notable changes to this project are documented here.

## [Unreleased] — 2026-03-18

### Added
- **NPC Patrol system** — server-side patrol loop (`server/src/npc/patrol-loop.ts`) that moves NPC units along admin-defined waypoints in real time
- **Admin: Patrols page** — full CRUD for patrol routes with waypoints, faction, radius, and speed settings
- **Admin: "Always Online" player field** — flag to keep a player permanently visible in online views
- **Admin: shared UI components** — `PageHeader`, `ToggleFilter`, `Pagination` extracted and reused across Players, Buildings, and Patrols pages
- **DB migration 0003** — `patrols` table for NPC patrol routes
- **DB migration 0004** — patrol config fields on the `players` table
- **Docs: NPC section** — `npc.md`, `boss.md`, `patrol.md`, `quest-master.md`

### Fixed
- Admin online filter now includes `role = 'npc'` so patrol NPCs appear alongside real players

---

## 2026-03-15

### Added
- **JWT authentication** — access token (15 min, in-memory) + refresh token (7 days, localStorage); `server/src/auth/jwt.ts`
- **PostgreSQL integration** — Drizzle ORM schema (`server/src/db/schema.ts`); tables: `players`, `staticObjects`, `inventory`, `playerTracks`, `hexVisited`, `hexOwnership`, `combatEvents`
- **Admin panel Svelte SPA** — reorganized into pages/router; served at `/admin/`
- **Admin: Buildings section** — CRUD for static game objects
- **Admin: online status & filter** — real-time online badge per player, toggle to show online-only
- **Shared enums** — `lib/enums.ts` / `lib/enums.js` / `server/src/types.ts` kept in sync; enum-sync test added
- **Admin i18n selects** — faction and rank dropdowns use translated labels
- **Client: objectType HUD** — selected unit's type shown in game HUD
- **HTTPS** — Nginx reverse proxy + Let's Encrypt certificate at `incuby.duckdns.org`
- **Test coverage** — comprehensive unit and integration tests for client and server (`vitest`)
- **Fog-of-war plan** — design doc and hex geogrid groundwork

### Fixed
- Ghost players after account switch and zombie WebSocket connections
- LOD dot size on iOS Safari (use `renderer.clientHeight`)
- Add `safeJson` helper to prevent crashes on malformed JSON

### Changed
- Migrated deployment from Heroku → VDS (pm2 + Nginx)

---

## 2026-03-14

### Added
- **Game HUD** — bottom-center panel with zoom display and message log (`client/src/ui/components/hud/GameHud.svelte`)
- **Unit selection** — click to select units; OutlinePass highlight in 3D mode, selection ring sprite in LOD dot mode; deselect on empty click
- **UnitActionMenu** — context action panel shown on unit selection
- **Zoom slider** — vertical logarithmic zoom slider; no jitter (local drag state)
- **Hex geogrid** — geographic hex grid design and fog-of-war visibility design doc
- **Svelte UI** — splash screen, game screen, sidebar, i18n with `svelte-i18n` and JSON locale files (`en`, `ru`)
- **Mermaid diagrams** — rendered in `/docs` via CDN
- **Docs sidebar nav** — collapsible navigation across all docs pages

### Fixed
- Mobile: disabled pinch zoom (`user-scalable=no`) and removed tap highlight/long-press context menu on canvas
- Zoom slider jitter; cursor always-pointer bug; first-click false selection; previous unit not deselecting
- `server/static/` directory creation before build copy

---

## 2026-03-13

### Changed
- Upgraded Vite to v8
- Added build date in browser console

---

## 2025-03 — Initial Development

### Added
- Project init: Three.js 3D client, Node.js + Express + WebSocket server
- Real-time multiplayer: GPS position broadcast to all connected clients; units rendered as 3D models or LOD dots
- Static objects support (buildings, points of interest)
- TypeScript throughout client and server; `lib/` shared library for geo math and enums
- Monorepo layout: `client/`, `server/`, `lib/`, `admin/`
