# Getting Started

## Prerequisites

- Node.js ≥ 14
- npm

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

This builds the client and copies the output into `server/static/`, so the server can serve it directly.

Then start the server:
```bash
npm run server
```

Open http://localhost:3000

## Deployment (Heroku)

Both client and server run on a single Heroku dyno.

Heroku build sequence:
1. `npm install` — installs root dependencies
2. `heroku-postbuild` — installs client deps, builds client, copies to `server/static/`
3. `Procfile` — installs server deps, compiles TypeScript, starts Express

Push to Heroku:
```bash
git push heroku main
```

The app is then accessible at the Heroku app URL (client served at `/`, WebSocket at the same host).
