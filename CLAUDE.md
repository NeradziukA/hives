# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development (from repo root)
```bash
npm run client          # Vite dev server for game client (port 5173)
npm run server:dev      # Watch-compile TypeScript server
npm run server:run      # Run compiled server with nodemon
# Run both server:dev and server:run in parallel for local dev
```

### Build & Deploy
```bash
npm run build           # Build client + admin → server/static/
npm run install:all     # Install deps in all packages 
```

### Server (from server/)
```bash
npm run db:generate     # Generate Drizzle migration after schema change
npm run db:migrate      # Apply pending migrations
npm run db:studio       # Drizzle Studio UI
npm run user:create     # Create a new player account
npm test                # vitest
npm run test:coverage
npm run lint
```

### Client / Admin (from client/ or admin/)
```bash
npm test                # vitest (client only)
npm run lint
```

### Single test
```bash
# From server/:
npx vitest run src/__tests__/enum-sync.test.ts
# From client/:
npx vitest run src/path/to/file.test.ts
```

### Process management
```bash
npx pm2 status          # The running process is named "hives"
npx pm2 restart hives
```

---

## Architecture

The project is a real-time multiplayer geographic game with three separate apps and a shared library.

```
lib/          — Shared TypeScript: enums, interfaces, geo utilities (imported by all packages)
server/       — Node.js + Express + WebSocket + Drizzle ORM (PostgreSQL)
client/       — Three.js 3D game frontend (Svelte 5 + Vite)
admin/        — Player/building management SPA (Svelte 5 + Vite)
```

### Shared enums (`lib/`)
- `lib/enums.ts` — source consumed by Vite (client, admin)
- `lib/enums.js` — manually maintained CommonJS mirror for the Node server
- `server/src/types.ts` — duplicates all enums; `server/src/__tests__/enum-sync.test.ts` asserts they stay in sync with `lib/enums.js`
- **When adding/changing an enum**, update all three: `lib/enums.ts`, `lib/enums.js`, `server/src/types.ts`

### WebSocket protocol
Defined in `server/src/types.ts` (`MessageType` enum, `SocketMessage` interface).

Connection lifecycle:
1. Client connects → sends `UNIT_AUTH { srcId, token }` (10s timeout)
2. Server replies `UNIT_AUTHENTICATED { id, config }`
3. Client sends `UNIT_GET_ALL { coords }` → server replies `INIT_UNITS { users[], staticObjects[] }`
4. Every ~10s: `UNIT_MOVED { id, coords }` broadcast to all others
5. Disconnect → server broadcasts `UNIT_DISCONNECTED { id }`

In-memory server state: `clientsSockets` (WebSocket map) and `users` (position map) in `server/src/websocket/index.ts`.

### Coordinate system
All scene positions are relative to the authenticated player's starting coords (origin = 0,0,0). Conversion helpers in `lib/geo/constants.ts`: `metersToLatitudeDegrees()`, `metersToLongitudeDegrees(lat)`.

### Authentication
JWT access tokens (15 min) + refresh tokens (7 days, stored in localStorage). Server validates via `server/src/auth/jwt.ts`.

### Client rendering
Three.js scene — `client/src/game.ts`. LOD: 3D model when > 20px screen size, dot otherwise. Unit metadata stored in `THREE.Object3D.userData` (`unitId`, `objectType`).

### Admin panel
Served at `/admin/`. Uses a custom i18n system (`admin/src/lib/i18n.svelte.ts`). The game client uses svelte-i18n with JSON files in `client/src/i18n/`. These are two separate i18n systems.

### Database
PostgreSQL + Drizzle ORM. Schema in `server/src/db/schema.ts`. Key tables: `players`, `staticObjects`, `inventory`, `playerTracks`, `hexVisited`, `hexOwnership`, `combatEvents`, `zombiePatrols`, `npcPatrols`.

### Static file serving
`npm run build` compiles client → `server/static/client/` and admin → `server/static/admin/`. The Express server serves these; no separate web server needed.
