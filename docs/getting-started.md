# Getting Started

## Prerequisites

- Node.js ≥ 24 (required by Vite 8)
- npm
- PostgreSQL database (required for server)

## Install Dependencies

```bash
# From project root
npm install
cd client && npm install
cd ../server && npm install
```

## Run in Development

Open two terminals:

**Terminal 1 — Server:**
```bash
cd server
npm run watch-ts   # compiles TypeScript on change
# in another tab:
npm run dev        # runs nodemon on compiled output
```

Or combined (build then run):
```bash
npm run server     # from project root — builds + starts server
```

**Terminal 2 — Client:**
```bash
npm run client     # from project root
# or
cd client && npm run dev
```

Client dev server: http://localhost:5173
Server (WebSocket + API): http://localhost:3000

## Build for Production

```bash
# Linux / Mac
npm run build-client

# Windows
npm run build-client-win
```

This builds the client and copies the output into `server/static/client/`, so the server can serve it directly.

Build the admin panel:
```bash
npm run build --prefix ./admin   # outputs to server/static/admin/
```

Then build and start the server:
```bash
cd server && npm run build
npm run server
```

Open http://localhost:3000

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
