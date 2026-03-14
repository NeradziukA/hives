---
name: deploy
description: Deploy to Heroku by pushing from the VPS via SSH
---

# Deploy to Heroku via VPS

Deploy is done from the VPS server `hstgr-hives` (`srv1491778.hstgr.cloud`, user `hives`).

## Steps

1. Ensure all local changes are committed and pushed to `origin main`
2. On the VPS — pull latest changes and push to Heroku:
   ```
   ssh hstgr-hives "cd ~/projects/hives && git pull origin main && git push heroku main"
   ```
3. Report the result — success or error output from Heroku

## Rules

- NEVER run if there are uncommitted local changes
- NEVER force push (`--force`)
- If the push fails, report the error as-is and stop
