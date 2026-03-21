---
name: deploy
description: Build client+admin and restart the hives pm2 process
---

# Deploy

Build the project and restart the running server via pm2.

## Steps

1. Run `npm run build` from the repo root (`/home/hives/projects/hives`)
   - This compiles client + admin → `server/static/`
   - If build fails, stop and report the error — do NOT restart pm2
2. Run `cd server && npx tsc && cd ..` from the repo root (`/home/hives/projects/hives`)
   - This compiles server TypeScript → `server/dist/`
   - If compilation fails, stop and report the error — do NOT restart pm2
3. Run `npx pm2 restart hives` from the repo root
4. Run `npx pm2 status` and report the result to the user

## Rules

- Always run both build steps before restart — never restart without successful builds
- If `npm run build` exits with a non-zero code, stop and show the error output
- If `npx tsc` exits with a non-zero code, stop and show the TypeScript errors
- Do not push to git, do not commit — deploy only
