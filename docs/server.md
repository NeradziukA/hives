# Server

Express + WebSocket backend. Source: [server/src/](../server/src/)

## Files

| File | Responsibility |
|------|---------------|
| [index.ts](../server/src/index.ts) | Express app; mounts routers; serves `static/`; starts HTTP + WS |
| [auth-router.ts](../server/src/auth-router.ts) | `POST /api/login` — verifies username/password, returns player `id` |
| [status-router.ts](../server/src/status-router.ts) | `GET /status` (JSON), `GET /status/ui` (dashboard) |
| [docs-router.ts](../server/src/docs-router.ts) | Express `Router` for `/docs` |
| [docs-render.ts](../server/src/docs-render.ts) | `renderDoc(title, body, nav)` — fills HTML shell |
| [types.ts](../server/src/types.ts) | Shared TypeScript types: `MessageType`, `User`, `Coordinates`, `SocketMessage` |
| [api/index.ts](../server/src/api/index.ts) | Re-exports `getStaticObjects()` from `db/queries` |
| [websocket/index.ts](../server/src/websocket/index.ts) | WebSocket server setup; delegates to connection handler |
| [db/schema.ts](../server/src/db/schema.ts) | Drizzle ORM schema: `players`, `static_objects`, `inventory`, etc. |
| [db/queries.ts](../server/src/db/queries.ts) | DB helper functions |

```mermaid
graph TD
    index["index.ts\nExpress · port 3000"]
    authRouter["auth-router.ts\nPOST /api/login"]
    statusRouter["status-router.ts\nGET /status"]
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

    index --> authRouter & statusRouter & wsIndex
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

## Authentication

Players are created manually. Connections require username+password login.

### Create a player

```bash
cd server && npm run user:create <username> <password>
```

This inserts a new row into the `players` table with a bcrypt-hashed password.

### Login flow

1. Client POSTs `{ username, password }` to `POST /api/login`
2. Server verifies password with bcrypt → returns `{ id }`
3. Client opens WebSocket, sends `UNIT_AUTH { srcId: id }`
4. Server looks up player in DB → sends `UNIT_AUTHENTICATED` or `AUTH_ERROR`

## WebSocket Handlers

Located in [server/src/websocket/handlers/](../server/src/websocket/handlers/)

| Handler | Trigger | Action |
|---------|---------|--------|
| `connect.ts` | New WS connection | Waits for `UNIT_AUTH`, verifies player in DB, registers in memory |
| `unit-get-all.ts` | `UNIT_GET_ALL` message | Sends `INIT_UNITS` with all users + static objects |
| `unit-move.ts` | `UNIT_MOVED` message | Updates user coords in map; broadcasts to all other clients; persists to DB |
| `close.ts` | Connection closed | Removes user from maps; broadcasts `UNIT_DISCONNECTED`; clears position buffer |

## Port

Server listens on **port 3000** (or `process.env.PORT` if set).

## State

Real-time positions are in-memory. Player data and history are persisted to PostgreSQL.

```typescript
clientsSockets: { [id: string]: WebSocket }  // online connections
users: { [id: string]: User }                // online player state
```

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

Both client and server deploy to **Heroku** from a single dyno.

`Procfile`:
```
web: cd server && npm install --include=dev && npm start
```

The built client ends up in `server/static/` and is served by Express at the root URL.
