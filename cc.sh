#!/bin/bash
# cc.sh — Command Center (Learning-Center)
# Starts a Claude Code session with CLAUDE.md loaded as context.
# Run from: /Users/johnshine/Dropbox/Fibonacco/Learning-Center/

CLAUDE_MD="/Users/johnshine/Dropbox/Fibonacco/Learning-Center/CLAUDE.md"

if [ ! -f "$CLAUDE_MD" ]; then
  echo "ERROR: CLAUDE.md not found at $CLAUDE_MD"
  exit 1
fi

cat "$CLAUDE_MD" | claude \
  --model claude-opus-4-8 \
  --dangerously-skip-permissions \
  --system-prompt "You are working on the Fibonacco Command Center (Learning-Center). CLAUDE.md has been loaded. Before any work: (1) Use Filesystem MCP to read LIVE files from /Users/johnshine/Dropbox/Fibonacco/Learning-Center/ — the /mnt/project/ snapshots are STALE and must never be used to evaluate what is built. (2) Run npm run verify and composer test before committing. Stack: Laravel 12 API + React 18 SPA + TypeScript + PostgreSQL on Railway. This is NOT Inertia — the frontend is a standalone React SPA (Vite + React Router + Zustand + TanStack Query) that talks to a JSON API. Critical rules: env() forbidden outside config/; UUID PKs on all migrations; no MySQL syntax; controllers return JSON not Inertia responses; pgvector enabled for AI embeddings. Repo path: /Users/johnshine/Dropbox/Fibonacco/Learning-Center/"
