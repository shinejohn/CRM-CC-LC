# CLAUDE.md — Fibonacco Learning Center

## What This Is
Single-app platform: Learning Center with campaign management, CRM, knowledge base, billing, and AI workflows.

Stack: **Laravel 12 API** + **React 18 SPA** + **TypeScript**, deployed on **Railway** (Nixpacks) with **PostgreSQL**.

## STOP — READ THIS BEFORE ANY CODE REVIEW OR GAP ANALYSIS

**This mistake has been made multiple times and must not happen again.**

The repo lives at `/Users/johnshine/Dropbox/Fibonacco/Learning-Center/`. Claude has Filesystem MCP access to it. The files in `/mnt/project/` are **stale read-only snapshots uploaded to project knowledge** — they are NEVER current after a build sprint.

### The failure mode (this has happened repeatedly):
1. User asks for a code review after completing a build
2. Claude reads `/mnt/project/` files instead of the live repo
3. Claude reports "not built" for things that are fully implemented
4. User correctly identifies that Claude reviewed old snapshots, not the actual code
5. Trust is damaged, time is wasted

### The rule — no exceptions:
- **ANY request involving what currently exists** (code review, gap analysis, audit, status check, "what's built", "what's missing") → use `Filesystem:list_directory`, `Filesystem:search_files`, `Filesystem:read_multiple_files`, `Filesystem:directory_tree` on `/Users/johnshine/Dropbox/Fibonacco/Learning-Center/`
- **FIRST action on any code review request** → `Filesystem:list_directory` or `Filesystem:search_files` on the live repo path. Not /mnt/project/. Not project_knowledge_search. The live filesystem.
- `/mnt/project/` is ONLY for reading spec documents and reference materials that were intentionally uploaded as project knowledge. It is NEVER a source of truth for implementation state.
- If you catch yourself about to read a .tsx, .ts, .php, or .css file from `/mnt/project/` to evaluate what's built — STOP. That file is stale. Read it from the live repo instead.

## Project Structure
```
/src/              → React SPA (Vite, React Router, Zustand, TanStack Query)
/src/command-center/ → Command Center section (own internal router, lazy-loaded pages)
/backend/          → Laravel 12 API (Sanctum auth, Horizon queues, Spatie permissions)
/content/          → Campaign source JSONs (60 files, eager-imported at build)
/public/campaigns/ → Runtime-loaded campaign JSONs (66 files)
/scripts/          → Build/deploy/verify scripts
```

**This is NOT Inertia.** Frontend and backend are decoupled — React SPA talks to Laravel API via Axios/TanStack Query.

## The Three Rules That Prevent 90% of Deploy Failures

1. **Never use `env()` outside of `config/` files.** Production caches config. `env()` returns null after `config:cache`.
2. **Never run composer scripts during Nixpacks install phase.** Use `--no-scripts` in install, run artisan commands explicitly in build phase.
3. **Check for duplicate route names before deploying.** Run `php artisan route:cache` locally — it catches collisions.

---

## PHP Conventions

Every Model: uses `HasUuids` trait, defines `$fillable`

Never commit: `dd()`, `dump()`, `ray()`, `var_dump()`

Environment vars: `config('services.openai.key')` — never `env('OPENAI_KEY')` outside config files

Controllers return JSON responses (not Inertia responses).

## Database (PostgreSQL — NOT MySQL)

Migrations:
- Primary keys: `$table->uuid('id')->primary()` — never `$table->id()`
- Foreign keys: `$table->foreignUuid('user_id')` — never `$table->foreignId()`
- Forbidden: `unsigned`, `tinyint`, `mediumint`, `ENUM`, `AUTO_INCREMENT`, `DATETIME`
- Use: `integer`, `smallInteger`, `text`, `uuid`, `timestamp`, `timestampTz`
- Every migration must have a `down()` method
- pgvector extension enabled for AI embeddings

## TypeScript / React Conventions

- Never use `any` type — define interfaces for all data
- Use `import type { X }` for type-only imports
- Remove unused imports
- No `console.log`, `console.debug`, `debugger` in committed code
- Routing: React Router (`<Link to="/path">`) — not Inertia
- State: Zustand stores in `src/stores/`
- Data fetching: TanStack Query + Axios in `src/services/`
- UI: Tailwind CSS + Radix UI + shadcn/ui patterns + Framer Motion
- Icons: Lucide React
- Buttons: always specify `type="button"` unless it's a form submit

## Accessibility

Every interactive element needs an accessible name:
- Icon-only buttons: `aria-label="description"`
- Toggles: `role="switch"` + `aria-checked` + `aria-label`
- Inputs: associated `<label>` or `aria-label`
- Images: `alt` text (empty `alt=""` for decorative only)

## Key Backend Packages

- `laravel/sanctum` — API authentication
- `laravel/horizon` — Redis queue monitoring (middleware config MUST be an array)
- `spatie/laravel-permission` — roles and permissions
- `spatie/laravel-data` — DTOs
- `spatie/laravel-query-builder` — API query filtering
- `anthropic-ai/sdk` — AI integration
- `stripe/stripe-php` — payments
- `predis/predis` — Redis client

## Deploy Pipeline (Railway / Nixpacks)

Config: `backend/nixpacks.toml`

```toml
[phases.install]
cmds = ["composer install --no-dev --optimize-autoloader --no-scripts"]

[phases.build]
cmds = [
  "php artisan package:discover --ansi",
  "php artisan config:cache",
  "php artisan route:cache",
  "php artisan event:cache"
]
```

- `.env` is NOT committed — Railway sets env vars via dashboard
- `composer.lock` IS committed for version pinning
- Migrations run separately: `railway run --service "CC API" "php artisan migrate --force"`
- Frontend builds via Railway's static site service (Vite)

## Pre-Deploy Checklist

Run from `backend/`:
```bash
php artisan route:cache && php artisan route:clear   # catch duplicate route names
php artisan config:cache && php artisan config:clear  # catch invalid config
php artisan event:cache && php artisan event:clear    # catch event issues
composer dump-autoload --optimize                     # catch PSR-4 mismatches
php artisan package:discover --ansi                   # catch provider issues
```

## Testing

- **Frontend**: Vitest (unit), Playwright (E2E), Testing Library
- **Backend**: PHPUnit (`backend/tests/`)
- **Linting**: ESLint (frontend), Laravel Pint (backend)
- Run: `npm test`, `npm run verify`, `composer test`

## When Adding New Features

1. Add env vars to `config/*.php` AND `.env.example` — never use `env()` directly
2. If it adds a migration, use UUID PKs and PostgreSQL syntax
3. If it adds API routes, use `api.` prefix for route names to avoid web route collisions
4. Run the pre-deploy checklist before pushing
