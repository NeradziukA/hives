# Server

Express + WebSocket backend. Source: [server/src/](../server/src/)

## Files

| File | Responsibility |
|------|---------------|
| [index.ts](../server/src/index.ts) | Express app; mounts routers; serves `static/` and `static/client/`; starts HTTP + WS |
| [auth/jwt.ts](../server/src/auth/jwt.ts) | JWT sign/verify helpers for access (15m) and refresh (7d) tokens |
| [docs-render.ts](../server/src/docs-render.ts) | `renderDoc(title, body, nav)` — fills HTML shell |
| [types.ts](../server/src/types.ts) | Shared TypeScript types: `MessageType`, `User`, `Coordinates`, `SocketMessage` |
| [api/index.ts](../server/src/api/index.ts) | Re-exports `getStaticObjects()` from `db/queries` |
| [websocket/index.ts](../server/src/websocket/index.ts) | WebSocket server setup; delegates to connection handler |
| [db/schema.ts](../server/src/db/schema.ts) | Drizzle ORM schema: `players`, `static_objects`, `inventory`, etc. |
| [db/queries.ts](../server/src/db/queries.ts) | DB helper functions |

### Routers (`server/src/routers/`)

| File | Responsibility |
|------|---------------|
| [routers/auth.ts](../server/src/routers/auth.ts) | `POST /api/login`, `POST /api/refresh`, `GET /api/profile` |
| [routers/admin.ts](../server/src/routers/admin.ts) | Serves admin SPA at `GET /admin/`; CRUD API at `/admin/api/users` (JWT-protected) |
| [routers/status.ts](../server/src/routers/status.ts) | `GET /status` (JSON), `GET /status/ui` (dashboard) |
| [routers/docs.ts](../server/src/routers/docs.ts) | `GET /docs` — renders Markdown docs as HTML |

```mermaid
graph TD
    index["index.ts\nExpress · port 3000"]
    authRouter["routers/auth.ts\nPOST /api/login\nPOST /api/refresh"]
    adminRouter["routers/admin.ts\nGET /admin/ → SPA\n/admin/api/users CRUD"]
    statusRouter["routers/status.ts\nGET /status"]
    staticClient["static/client/\nGame SPA (Svelte)"]
    staticAdmin["static/admin/\nAdmin SPA (Svelte)"]
    wsIndex["websocket/index.ts\nWebSocket server setup"]
    db["db/\nDrizzle + PostgreSQL"]
    types["types.ts\nMessageType · User · StaticObject"]
    logger["logger.ts"]

    subgraph Handlers["websocket/handlers/"]
        connect["connect.ts\nwait UNIT_AUTH → authenticate"]
        unitGetAll["unit-get-all.ts\nUNIT_GET_ALL → INIT_UNITS"]
        unitMove["unit-move.ts\nUNIT_MOVED → broadcast"]
        close["close.ts\ndisconnect → UNIT_DISCONNECTED"]
    end

    subgraph State["In-Memory State"]
        sockets["clientsSockets\nMap&lt;id, WebSocket&gt;"]
        users["users\nMap&lt;id, User&gt;"]
    end

    index --> authRouter & adminRouter & statusRouter & wsIndex
    index --> staticClient & staticAdmin
    adminRouter --> staticAdmin & db
    wsIndex --> connect
    connect --> unitGetAll & unitMove & close
    connect --> db
    authRouter --> db
    unitGetAll --> State
    unitMove --> State & db
    close --> State
    connect --> State
    Handlers --> logger & types
```

## Admin Panel

A standalone Svelte 5 SPA served at `/admin/`. Source: [admin/src/](../admin/src/)

### Structure

```
admin/src/
├── lib/            # Logic layer: types, i18n, auth tokens, api client, toast store
├── components/ui/  # Stateless presentational: Badge, Spinner
├── components/     # Stateful UI: Sidebar, Toast
├── dialogs/        # Modal dialogs: LoginDialog, ConfirmDialog, PlayerModal
└── pages/          # PlayersPage — search, table, pagination
```

### Auth

Uses the same JWT tokens as the game client (`POST /api/login`, `POST /api/refresh`). The access token is stored in memory, the refresh token in `localStorage`. On 401 the SPA silently refreshes before retrying.

### API

All endpoints under `/admin/api/` require `Authorization: Bearer <accessToken>`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/api/users` | Paginated player list; search by name/ID or lat/lng radius |
| `GET` | `/admin/api/users/:id` | Single player |
| `POST` | `/admin/api/users` | Create player |
| `PUT` | `/admin/api/users/:id` | Update player (optional password change) |
| `DELETE` | `/admin/api/users/:id` | Delete player |

### Build

```bash
npm run build --prefix ./admin   # outputs to server/static/admin/
```

The `scripts/build.sh` (and `build.bat`) run the admin build automatically after the client build.

## Authentication

Players are created manually. Connections require username+password login.

### Create a player

```bash
cd server && npm run user:create <username> <password>
```

This inserts a new row into the `players` table with a bcrypt-hashed password.

### Login flow

1. Client POSTs `{ username, password }` to `POST /api/login`
2. Server verifies password with bcrypt → returns `{ accessToken, refreshToken, id }`
   - `accessToken` — JWT, expires in **15 minutes**
   - `refreshToken` — JWT, expires in **7 days** (stored in `localStorage`)
3. Client opens WebSocket, sends `UNIT_AUTH { srcId: id, token: accessToken }`
4. Server validates JWT signature → sends `UNIT_AUTHENTICATED` or `AUTH_ERROR`

### Refresh flow

On page reload the access token is gone (in-memory only). The client uses the saved refresh token:

1. Client POSTs `{ refreshToken }` to `POST /api/refresh`
2. Server verifies refresh token → returns new `{ accessToken, id }`
3. Client shows **Continue** button (skips login form)

### Environment variables

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |

## WebSocket Handlers

Located in [server/src/websocket/handlers/](../server/src/websocket/handlers/)

| Handler | Trigger | Action |
|---------|---------|--------|
| `connect.ts` | New WS connection | Waits for `UNIT_AUTH` (10 s timeout), verifies player in DB, closes any previous socket for same player, registers in memory; starts 5-minute idle timer reset on each `UNIT_MOVED` |
| `unit-get-all.ts` | `UNIT_GET_ALL` message | Sends `INIT_UNITS` with all users + static objects |
| `unit-move.ts` | `UNIT_MOVED` message | Updates user coords in map; broadcasts to all other clients; persists to DB |
| `close.ts` | Connection closed | Checks socket identity (ignores stale socket if replaced by a newer connection); removes user from maps; broadcasts `UNIT_DISCONNECTED`; clears position buffer |

## Port

Server listens on **port 3000** (or `process.env.PORT` if set).

## State

Real-time positions are in-memory. Player data and history are persisted to PostgreSQL.

```typescript
clientsSockets: { [id: string]: WebSocket }  // online connections
users: { [id: string]: User }                // online player state
```

## Testing

Tests use [Vitest](https://vitest.dev/) with the `node` environment.

```bash
cd server && npm test              # run all tests
cd server && npm run test:coverage # run with HTML coverage report
```

| Test file | Covers |
|-----------|--------|
| [`__tests__/auth.test.ts`](../server/src/__tests__/auth.test.ts) | WS authentication flow: valid JWT, missing token, invalid token |
| [`__tests__/jwt.test.ts`](../server/src/__tests__/jwt.test.ts) | `signAccess`, `verifyAccess`, `signRefresh`, `verifyRefresh`; expired and cross-secret rejection |
| [`__tests__/refresh.test.ts`](../server/src/__tests__/refresh.test.ts) | `POST /api/refresh`: missing token, invalid token, unknown player, success |
| [`__tests__/websocket-messages.test.ts`](../server/src/__tests__/websocket-messages.test.ts) | Post-auth WS messages: `UNIT_GET_ALL→INIT_UNITS`, `UNIT_MOVED` broadcast, `UNIT_DISCONNECTED`, invalid JSON |
| [`__tests__/db-queries.test.ts`](../server/src/__tests__/db-queries.test.ts) | Position buffer: deduplication, 30 s window, insert/update routing |

Coverage reports are written to `server/coverage/` (git-ignored).

## Development

```bash
# Compile TypeScript
cd server && npm run build

# Run tests
cd server && npm run test

# Watch TypeScript changes
cd server && npm run watch-ts

# Run compiled output with nodemon
cd server && npm run dev

# Build + run (used in production)
npm run server  # from project root

# DB migrations
cd server && npm run db:generate
cd server && npm run db:migrate
```

## Environment

Requires `DATABASE_URL` in `.env` (local) or Heroku Config Vars:

```
DATABASE_URL=postgresql://user:password@host:5432/hives
```

## Deployment

The server runs on the VDS at `145.223.80.56`.

```bash
# Build and start with pm2
npm run build
cd server && npm run build
npx pm2 start dist/index.js --name hives
```

Static files layout (all git-ignored, populated by build scripts):
- `server/static/client/` — game SPA, served at `/`
- `server/static/admin/` — admin SPA, served at `/admin/`

See [VDS_RUN.md](../VDS_RUN.md) for the full setup guide.
