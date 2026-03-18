# Getting Started

## Prerequisites

- Node.js ≥ 24 (required by Vite 8)
- npm
- PostgreSQL database (required for server)

## Install Dependencies

```bash
npm run install:all    # installs deps in all packages (root, client, server, admin)
```

## Run in Development

Open two terminals:

**Terminal 1 — Server (run both in parallel):**
```bash
npm run server:dev     # watch-compile TypeScript server
npm run server:run     # run compiled server with nodemon
```

**Terminal 2 — Client:**
```bash
npm run client         # Vite dev server at http://localhost:5173
```

Client dev server: http://localhost:5173
Server (WebSocket + API): http://localhost:3000

## Build for Production

```bash
npm run build          # builds client + admin → server/static/
```

This compiles both SPAs into `server/static/`, so the Express server can serve them directly:
- `server/static/client/` — game SPA served at `/`
- `server/static/admin/` — admin SPA served at `/admin/`

## Deployment (VDS + pm2)

The project runs on a VDS accessible at `https://incuby.duckdns.org`. Nginx terminates TLS on port 443 and proxies all traffic (HTTP and WebSocket) to `localhost:3000`. The Node.js process is managed by pm2 under the name `hives`.

Build and restart:
```bash
npm run build          # builds client → server/static/client/
cd server && npm run build   # compiles server TypeScript
npx pm2 restart hives  # restart the running pm2 process
```

Static files layout (all git-ignored, populated by build scripts):
- `server/static/client/` — game SPA, served at `/`
- `server/static/admin/` — admin SPA, served at `/admin/`

See [VDS_RUN.md](../VDS_RUN.md) for the full server setup guide.
