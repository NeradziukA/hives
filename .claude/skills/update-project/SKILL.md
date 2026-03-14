---
name: update-project
description: Fetch latest changes from all remotes and report the result
---

# Update Project

Run `git fetch --all --prune` to retrieve the latest changes from all remotes without modifying the working tree.

## Steps

1. Run `git fetch --all --prune`
2. Run `git status` to show the current branch state relative to remote
3. Report to the user:
   - Which remotes were fetched
   - Whether the local branch is behind, ahead, or up to date
   - Any new remote branches or deleted remote branches detected
   - Any errors encountered

## Rules

- Do NOT merge, pull, or rebase — fetch only
- Report the full output clearly
