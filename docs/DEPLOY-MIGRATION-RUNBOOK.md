# Deploy & Migration Runbook — Assessment Remediation

For deploying the merged remediation (PR #1, `main`) to Railway prod. Covers the **10 new migrations**, required env vars, and verification. Read fully before running — one migration is intentionally destructive to already-broken columns.

---

## 0. TL;DR order of operations
1. **Back up the prod DB** (the bigint→uuid migration discards unusable data — see §2).
2. Deploy the code to Railway (both `CRM-CC-LC` API + `horizon` services).
3. Set/confirm the **env vars** (§4) in the Railway dashboard.
4. Run **migrations** once, against the CC DB (§3).
5. **Restart** the services so boot-time `config:cache` picks up the new env (§4).
6. **Verify** (§5).

Migrations are NOT run by the deploy pipeline — they are run manually (per CLAUDE.md).

---

## 1. The 10 new migrations (run automatically in filename order by `migrate`)

| Order | Migration | Effect | Risk |
|---|---|---|---|
| 1 | `2026_07_01_000001_create_stripe_webhook_events_table` | New table (Stripe event idempotency) | Safe / additive |
| 2 | `2026_07_01_000001_fix_bigint_fk_columns_to_uuid` | **pgsql-only** ALTER of 10 bigint FK cols → uuid | **Destructive** (see §2) |
| 3 | `2026_07_01_000002_create_revenue_records_table` | New table | Safe / additive |
| 4 | `2026_07_01_000003_backfill_users_system_tenant_id` | `UPDATE users SET tenant_id = system_tenant WHERE tenant_id IS NULL` | Safe (null rows only) — **required so existing operators keep customer access** |
| 5 | `2026_07_01_000004_add_status_to_email_conversations_table` | Add `status` column (default `pending`) | Safe / additive |
| 6 | `2026_07_01_000010_create_dashboard_widgets_table` | New table | Safe / additive |
| 7 | `2026_07_01_000101_create_training_datasets_table` | New table | Safe / additive |
| 8 | `2026_07_01_000102_create_training_examples_table` | New table | Safe / additive |
| 9 | `2026_07_01_000103_create_training_runs_table` | New table | Safe / additive |
| 10 | `2026_07_01_000104_create_agent_knowledge_configs_table` | New table | Safe / additive |

> The two `...000001_*` files share a timestamp; Laravel orders by full filename, so `create_stripe_webhook_events` runs before `fix_bigint_fk_columns`. Correct.

**Also modified (do NOT need action on prod):** 10 original `create_*` migrations had their column types corrected (bigint→uuid, added Sponsorship/NewsletterSchedule columns, etc.). These only affect **fresh** databases (CI/SQLite tests and any brand-new Postgres). On the existing prod DB they are already marked "ran" and will not re-execute — the prod repair is done by migration #2.

---

## 2. The one destructive migration — read this

`2026_07_01_000001_fix_bigint_fk_columns_to_uuid` widens these columns from `bigint` to `uuid` on Postgres:

```
analytics_events.smb_id, analytics_events.community_id,
chat_messages.smb_id, email_conversations.smb_id,
unsubscribe_tokens.scope_id, suppression_list.community_id,
alert_sends.email_message_id, alert_sends.sms_message_id, alert_sends.push_message_id,
sessions.user_id
```

Postgres has no bigint→uuid cast, so it converts via `USING NULL::uuid` — **existing values in these columns become NULL.**

Why this is acceptable: every one of these columns was a bigint pointing at a **uuid** parent key, so the stored integers never matched anything and were already dead. The one with live traffic is `sessions.user_id` (DB session driver) — nulling it invalidates existing **web sessions**, so anyone on cookie/session auth must log in again. **Sanctum API tokens (`personal_access_tokens`) are unaffected**, so SPA operators using bearer tokens are NOT logged out.

Per-column guarded with `Schema::hasColumn`; the whole migration early-returns on non-pgsql. It has a `down()` (reverts to bigint).

**Action:** take a DB snapshot before running (Railway → CC Postgres → Backups), so you can roll back if anything unexpected is in those columns.

---

## 3. Run the migrations

Dry-run first to preview the pending list:
```bash
railway run --service "CRM-CC-LC" "php artisan migrate:status"
```

Then apply:
```bash
railway run --service "CRM-CC-LC" "php artisan migrate --force"
```

Or, running against the CC DB from your machine (pattern from MEMORY.md):
```bash
railway run -- env \
  DATABASE_URL="postgresql://postgres:PASS@trolley.proxy.rlwy.net:53826/railway" \
  DB_HOST=trolley.proxy.rlwy.net DB_PORT=53826 \
  php artisan migrate --force
```

Expected: 10 migrations run, ending green. If #2 fails on a column that doesn't exist, that's fine — it's guarded and skips.

---

## 4. Env vars (Railway dashboard) — set BEFORE restart

`config:cache` now runs at **boot** (in `start.sh`), so env changes only take effect after a service **restart/redeploy**.

| Var | Value | Service | Why |
|---|---|---|---|
| `RUN_SCHEDULER` | `1` | **horizon only** | Scheduler now runs only where this is truthy. Set on exactly ONE service (recommended: `horizon`). Leave unset/`0` on the API service. |
| `APP_URL` | real https URL (e.g. `https://<api-domain>`) | both | Was baked to `http://localhost` at build; now read at boot. Twilio SMS/call status callbacks depend on it. |
| `QUEUE_CONNECTION` | `redis` | both | Horizon only drains redis; the shipped example default was `database`. |
| `REDIS_QUEUE_RETRY_AFTER` | `7800` (optional) | both | Code default is already `7800` (> the 7200s maintenance-job timeout, prevents double-processing). Only set to override. |
| `BROADCAST_CONNECTION` | `reverb`/`pusher` **once a server is provisioned** | both | Currently `log`. The CC AI-task progress UI stays silent until a Pusher-compatible broadcaster exists (none installed yet). Not required for this deploy. |
| Stripe / Postal secrets | real values | both | Webhooks now **fail closed** — if `STRIPE_WEBHOOK_SECRET` / `POSTAL_WEBHOOK_SIGNING_KEY` are empty, those webhooks reject everything. Confirm they are set. |

After setting: **redeploy or restart** both services so boot re-caches config.

---

## 5. Verify

```bash
# migrations applied
railway run --service "CRM-CC-LC" "php artisan migrate:status" | tail -15

# one API service should run the scheduler; check horizon is draining
railway logs --service "horizon" | grep -i "schedule\|horizon"

# route cache builds clean (no duplicate names)
railway run --service "CRM-CC-LC" "php artisan route:cache && php artisan route:clear"
```

Spot-check in the app / via curl (with a valid operator token):
- Login works (`POST /api/v1/auth/login`).
- CRM lists return data (operators are on the system tenant post-backfill; a brand-new self-registered user should see **zero** customers — that's the fix working).
- `GET /api/v1/ops/ai-sessions` returns `{data, meta}` (requires an active `municipal_admins` row for the user).
- `GET /api/v1/dashboard/widgets` returns the default widget set.
- A Stripe webhook with a valid signature is accepted; one without is rejected (fail-closed).

DB sanity:
```sql
-- backfill worked: no operator left tenant-less
SELECT count(*) FROM users WHERE tenant_id IS NULL;              -- expect 0
-- FK columns are uuid now
SELECT data_type FROM information_schema.columns
  WHERE table_name='sessions' AND column_name='user_id';         -- expect 'uuid'
```

---

## 6. Rollback

- **Code:** revert the merge commit on `main` and redeploy.
- **DB:** the destructive migration has a `down()` (uuid→bigint), but it will **not** restore the nulled values. If those columns mattered, restore from the §2 snapshot instead. The additive table/column migrations roll back cleanly with `php artisan migrate:rollback --step=N`.

---

## Notes
- Prod HTTP still uses `php artisan serve` (no prod server in the Nixpacks image); consider FrankenPHP/php-fpm later. Set `PHP_CLI_SERVER_WORKERS` in Railway for more workers meanwhile.
- The training "Train" action enqueues a job that is an honest placeholder — there is no ML training backend to connect to yet.
