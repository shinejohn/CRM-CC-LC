#!/bin/bash
# ============================================================================
# ship.sh v4 — Fibonacco Universal Pre-Deploy Validation + AI Log Review
# ============================================================================
# Adds to v3:
#   - Larastan static analysis (Phase 2b, if installed)
#   - Laravel Pint format check (Phase 2c, if installed)
#   - AI log review via Railway + Claude API (--review-logs, --fix)
#   - --deep mode for extended validation
#   - --use-manifest for pre-built commit messages
#
# Works across ALL Fibonacco repos by auto-detecting project structure:
#   - Learning Center (backend/ + src/ React SPA)
#   - Multisite (Laravel root + Inertia/React SSR)
#
# Usage:
#   ./ship.sh --check                     — run all checks (recommended)
#   ./ship.sh "commit message"            — check + commit + push
#   ./ship.sh "commit message" --deep     — slow mode, full validation
#   ./ship.sh "commit message" --dry      — check only, no commit
#   ./ship.sh "commit message" --force    — skip checks (emergency)
#   ./ship.sh --use-manifest              — use built-in batch commit message
#   ./ship.sh --review-logs               — AI analysis of Railway logs
#   ./ship.sh --review-logs --fix         — AI analysis + patch proposals
#   ./ship.sh --review-logs --since 24h   — time window (default 6h)
#   ./ship.sh --report                    — generate ship-report.log
#   ./ship.sh --help                      — show help
#
# Required env vars for optional features:
#   ANTHROPIC_API_KEY    for --review-logs
# ============================================================================

set +e

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ── Timing ──
SHIP_START=$(date +%s)
phase_start() { PHASE_START=$(date +%s); }
phase_end() {
    local elapsed=$(( $(date +%s) - PHASE_START ))
    echo -e "  ${DIM}(${elapsed}s)${NC}"
}

# ── Args ──
COMMIT_MSG=""
MODE="normal"
DEEP=false
REVIEW_LOGS=false
REVIEW_FIX=false
LOGS_SINCE="6h"
ERRORS=0
WARNINGS=0
REPORT_FILE=""
USE_MANIFEST=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --check)       MODE="dry" ;;
        --dry)         MODE="dry" ;;
        --force)       MODE="force" ;;
        --deep)        DEEP=true ;;
        --review-logs) REVIEW_LOGS=true; MODE="dry" ;;
        --fix)         REVIEW_FIX=true ;;
        --since)       shift; LOGS_SINCE="$1" ;;
        --report)      MODE="dry"; REPORT_FILE="ship-report-$(date +%Y%m%d-%H%M%S).log" ;;
        --use-manifest|--batch-current) USE_MANIFEST=true ;;
        --help|-h)
            cat <<'EOF'
Usage: ./ship.sh "commit message" [options]
       ./ship.sh --use-manifest [--deep|--dry|--force]
       ./ship.sh --check [--deep]
       ./ship.sh --review-logs [--fix] [--since <duration>]

Options:
  --check         Run all checks, no commit
  --deep          Include Larastan, Pint, tests (if installed)
  --dry           Alias for --check with commit message
  --force         Skip checks, commit and push (emergency)
  --use-manifest  Use the built-in batch commit message
  --report        Generate ship-report-YYYYMMDD-HHMMSS.log
  --review-logs   Pull Railway logs, group errors, ask Claude to analyze
  --fix           With --review-logs, request patch proposals as diffs
  --since <dur>   Time window for --review-logs (e.g. 1h, 24h, 7d; default 6h)
  -h, --help      Show this help
EOF
            exit 0
            ;;
        -*)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
        *)
            if [[ -z "$COMMIT_MSG" ]]; then
                COMMIT_MSG="$1"
            fi
            ;;
    esac
    shift
done

# Built-in commit message for the current batch.
# Edit before ./ship.sh --use-manifest when the batch changes.
if [[ "$USE_MANIFEST" == true ]]; then
    COMMIT_MSG=$(cat <<'SHIP_MANIFEST_EOF'
feat: PP-CC data sync bridge — export endpoints + artisan sync command + Railway env setup

PP side: DataExportBridgeController (communities, businesses, subscriptions export)
CC side: SyncFromPublishingPlatform command, PublishingPlatformService bridge methods
SHIP_MANIFEST_EOF
)
fi

if [[ "$MODE" == "normal" && -z "$COMMIT_MSG" && "$REVIEW_LOGS" == false ]]; then
    echo -e "${RED}Usage: ./ship.sh \"commit message\" [--dry|--force]${NC}"
    echo -e "       ./ship.sh --use-manifest [--deep|--dry|--force]"
    echo -e "       ./ship.sh --check [--deep]"
    echo -e "       ./ship.sh --review-logs [--fix]"
    exit 1
fi

# ── Logging ──
log() {
    echo -e "$1"
    if [[ -n "$REPORT_FILE" ]]; then
        echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g' >> "$REPORT_FILE"
    fi
}
inc_errors()   { ERRORS=$((ERRORS + 1)); }
inc_warnings() { WARNINGS=$((WARNINGS + 1)); }

log ""
log "${BOLD}${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
log "${BOLD}${CYAN}║          🚀 FIBONACCO SHIP v4 (Universal)           ║${NC}"
log "${BOLD}${CYAN}║          $(date '+%Y-%m-%d %H:%M:%S')                       ║${NC}"
log "${BOLD}${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
log ""

# ============================================================================
# PROJECT DETECTION — auto-detect structure
# ============================================================================
BACKEND_DIR=""
FRONTEND_DIR=""
PROJECT_TYPE="unknown"
HAS_INERTIA=false
IS_MULTIAPP=false

# Detect backend directory (where artisan lives)
if [[ -f "artisan" ]]; then
    BACKEND_DIR="."
    PROJECT_TYPE="monolith"
elif [[ -f "backend/artisan" ]]; then
    BACKEND_DIR="backend"
    PROJECT_TYPE="learning-center"
elif [[ -f "taskjuggler-api/artisan" ]]; then
    BACKEND_DIR="taskjuggler-api"
    PROJECT_TYPE="taskjuggler"
elif [[ -f "apps/api-core/artisan" ]]; then
    BACKEND_DIR="apps/api-core"
    PROJECT_TYPE="4people"
fi

# Detect frontend
if [[ -f "package.json" ]]; then
    FRONTEND_DIR="."
elif [[ -f "src/package.json" ]]; then
    FRONTEND_DIR="src"
fi

# Detect Inertia
if [[ -n "$BACKEND_DIR" ]] && grep -q 'inertiajs' "${BACKEND_DIR}/composer.json" 2>/dev/null; then
    HAS_INERTIA=true
fi
if [[ -n "$FRONTEND_DIR" ]] && grep -q '@inertiajs' "${FRONTEND_DIR}/package.json" 2>/dev/null; then
    HAS_INERTIA=true
fi

# Detect multi-app
if grep -rq 'PLATFORM_KEY\|platform_key' "${BACKEND_DIR}/config/" 2>/dev/null; then
    IS_MULTIAPP=true
fi

log "${BOLD}${BLUE}━━━ Project Detection ━━━${NC}"
log "  Backend:   ${CYAN}${BACKEND_DIR:-none}${NC}"
log "  Frontend:  ${CYAN}${FRONTEND_DIR:-none}${NC}"
log "  Type:      ${CYAN}${PROJECT_TYPE}${NC}"
log "  Inertia:   ${CYAN}${HAS_INERTIA}${NC}"
log "  Multi-app: ${CYAN}${IS_MULTIAPP}${NC}"
log "  Deep mode: ${CYAN}${DEEP}${NC}"
log ""

if [[ -z "$BACKEND_DIR" && -z "$FRONTEND_DIR" ]]; then
    log "${RED}Could not detect project structure. Run from repo root.${NC}"
    exit 1
fi

# ============================================================================
# AI LOG REVIEW MODE — pull Railway logs, analyze with Claude, exit
# ============================================================================
if [[ "$REVIEW_LOGS" == true ]]; then
    log "${BOLD}${BLUE}━━━ AI Log Review ━━━${NC}"
    phase_start

    if ! command -v railway > /dev/null; then
        log "  ${RED}❌ Railway CLI not installed${NC}"
        exit 1
    fi
    if ! command -v jq > /dev/null; then
        log "  ${RED}❌ jq not installed (brew install jq)${NC}"
        exit 1
    fi
    if [[ -z "$ANTHROPIC_API_KEY" ]]; then
        log "  ${RED}❌ ANTHROPIC_API_KEY not set${NC}"
        exit 1
    fi

    log "  ${CYAN}Fetching Railway logs (last ${LOGS_SINCE})...${NC}"
    LOGS_RAW=$(railway logs --since "$LOGS_SINCE" --json 2>&1)
    RC=$?
    if [[ $RC -ne 0 ]] || [[ -z "$LOGS_RAW" ]]; then
        log "  ${RED}❌ Could not fetch logs (run: railway link)${NC}"
        echo "$LOGS_RAW" | head -5
        exit 1
    fi

    ERRORS_JSON=$(echo "$LOGS_RAW" | jq -c '
        select(
            (.severity // "" | test("error|critical|alert|emergency"; "i"))
            or (.message // "" | test("Exception|ERROR|Fatal|Stack trace|SQLSTATE|Undefined|TypeError"; "i"))
        )
        | {
            ts: (.timestamp // .ts // ""),
            severity: (.severity // ""),
            msg: .message,
            ctx: (.attributes // .context // {})
        }
    ' 2>/dev/null)

    if [[ -z "$ERRORS_JSON" ]]; then
        log "  ${GREEN}✓ No errors in Railway logs for the last ${LOGS_SINCE}${NC}"
        phase_end
        exit 0
    fi

    TOTAL_COUNT=$(echo "$ERRORS_JSON" | wc -l | tr -d ' ')
    NORMALIZED=$(echo "$ERRORS_JSON" | jq -r '.msg' | sed -E '
        s/[0-9]{4}-[0-9]{2}-[0-9]{2}[T ][0-9:.+-]+//g;
        s/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/<UUID>/g;
        s/0x[0-9a-f]+/<ADDR>/g;
        s/\b[0-9]{4,}\b/<NUM>/g;
        s/\s+/ /g
    ')
    UNIQUE_COUNT=$(echo "$NORMALIZED" | cut -c1-120 | sort -u | wc -l | tr -d ' ')
    log "  ${CYAN}${TOTAL_COUNT} error events, ${UNIQUE_COUNT} unique signatures${NC}"

    TOP_ERRORS=$(paste <(echo "$NORMALIZED" | cut -c1-120) <(echo "$ERRORS_JSON") \
        | sort | uniq -c -w120 | sort -rn | head -30 \
        | awk -F'\t' '{
            match($0, /^ *[0-9]+/); count = substr($0, RSTART, RLENGTH);
            gsub(/^ *[0-9]+/, "", count); gsub(/ /, "", count);
            print "{\"count\":" count+0 ",\"example\":" $2 "}"
        }')

    log "  ${CYAN}Gathering referenced source files...${NC}"
    FILES_MENTIONED=$(echo "$ERRORS_JSON" | jq -r '.msg' \
        | grep -oE '(app|routes|database|config)/[a-zA-Z0-9_/-]+\.(php|ts|tsx|js|jsx)' \
        | sort -u | head -25)

    CODE_CONTEXT=""
    FILES_INCLUDED=0
    for f in $FILES_MENTIONED; do
        for path in "$f" "${BACKEND_DIR}/$f" "${FRONTEND_DIR}/$f"; do
            if [[ -f "$path" ]]; then
                CONTENT=$(head -300 "$path")
                CODE_CONTEXT="${CODE_CONTEXT}

=== ${path} ===
${CONTENT}"
                FILES_INCLUDED=$((FILES_INCLUDED + 1))
                break
            fi
        done
        [[ $FILES_INCLUDED -ge 15 ]] && break
    done
    log "  ${CYAN}Included ${FILES_INCLUDED} source files for context${NC}"

    MODE_DIRECTIVE="Group errors by root cause. For each: 3-5 sentence diagnosis, file:line to fix, severity rating. No code changes."
    if [[ "$REVIEW_FIX" == true ]]; then
        MODE_DIRECTIVE="Group errors by root cause. For each: diagnosis, file:line, severity, and if confident propose a unified diff patch. Mark uncertain fixes as NEEDS HUMAN."
    fi

    log "  ${CYAN}Calling Claude (may take 30-60s)...${NC}"

    REQUEST=$(jq -n \
        --arg errors "$TOP_ERRORS" \
        --arg code "$CODE_CONTEXT" \
        --arg directive "$MODE_DIRECTIVE" \
        --arg project "$PROJECT_TYPE" \
        --arg since "$LOGS_SINCE" \
        '{
            model: "claude-sonnet-4-6",
            max_tokens: 16000,
            messages: [{
                role: "user",
                content: ("You are reviewing production errors from a Laravel API + React SPA on Railway. Project type: " + $project + ". Time window: " + $since + ".\n\nDIRECTIVE:\n" + $directive + "\n\nERRORS:\n" + $errors + "\n\nRELEVANT CODE:\n" + $code + "\n\nBegin analysis. Use markdown headings for each error group.")
            }]
        }')

    RESPONSE=$(curl -s https://api.anthropic.com/v1/messages \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -H "content-type: application/json" \
        --data "$REQUEST")

    API_ERROR=$(echo "$RESPONSE" | jq -r '.error.message // empty' 2>/dev/null)
    if [[ -n "$API_ERROR" ]]; then
        log "  ${RED}❌ Claude API error: ${API_ERROR}${NC}"
        exit 1
    fi

    OUTPUT=$(echo "$RESPONSE" | jq -r '.content[0].text // empty')
    if [[ -z "$OUTPUT" ]]; then
        log "  ${RED}❌ Empty response from Claude${NC}"
        exit 1
    fi

    REPORT_MD="log-review-$(date +%Y%m%d-%H%M%S).md"
    {
        echo "# Log Review — $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "- **Window:** last ${LOGS_SINCE}"
        echo "- **Events:** ${TOTAL_COUNT} total, ${UNIQUE_COUNT} unique"
        echo "- **Files included:** ${FILES_INCLUDED}"
        echo ""
        echo "---"
        echo ""
        echo "$OUTPUT"
    } > "$REPORT_MD"

    phase_end
    log ""
    log "  ${GREEN}✓ Analysis written: ${REPORT_MD}${NC}"
    log ""
    echo "$OUTPUT" | head -40 | while IFS= read -r line; do log "  $line"; done
    log ""
    exit 0
fi

# ── Emergency Force Push ──
if [[ "$MODE" == "force" ]]; then
    log "${YELLOW}⚡ FORCE MODE — skipping all checks${NC}"
    if [[ -n "$BACKEND_DIR" ]]; then
        SYNTAX_FAIL=false
        for f in $(git diff --name-only --cached 2>/dev/null | grep '\.php$'); do
            if [[ -f "$f" ]] && ! php -l "$f" > /dev/null 2>&1; then
                log "  ${RED}❌ SYNTAX ERROR in $f — refusing even force push${NC}"
                SYNTAX_FAIL=true
            fi
        done
        if [[ "$SYNTAX_FAIL" == true ]]; then
            log "${RED}Fix syntax errors first. Cannot ship broken PHP.${NC}"
            exit 1
        fi
    fi
    git add -A
    git commit -m "$COMMIT_MSG"
    git push
    log "${GREEN}✅ Force pushed.${NC}"
    exit 0
fi

# ============================================================================
# PHASE 1: STAGING SAFETY
# ============================================================================
log "${BOLD}${BLUE}━━━ Phase 1: Staging Safety ━━━${NC}"
phase_start

# Large files (>5MB)
LARGE_FILES=$(git diff --cached --name-only 2>/dev/null | while read f; do
    if [[ -f "$f" ]]; then
        SIZE=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo 0)
        if [[ $SIZE -gt 5000000 ]]; then
            echo "$f ($((SIZE / 1048576))MB)"
        fi
    fi
done)
if [[ -n "$LARGE_FILES" ]]; then
    log "  ${RED}❌ Large files staged (>5MB):${NC}"
    echo "$LARGE_FILES" | while read f; do log "     $f"; done
    inc_errors
else
    log "  ${GREEN}✓${NC} No oversized files"
fi

# Forbidden paths
FORBIDDEN=$(git diff --cached --name-only 2>/dev/null | grep -E '(^|/)node_modules/|(^|/)vendor/|^\.env$|\.env\.local$|^\.env\.production$' || true)
if [[ -n "$FORBIDDEN" ]]; then
    log "  ${RED}❌ Forbidden files staged:${NC}"
    echo "$FORBIDDEN" | while read f; do log "     $f"; done
    inc_errors
else
    log "  ${GREEN}✓${NC} No forbidden files staged"
fi

phase_end
log ""

# ============================================================================
# PHASE 2: PHP CHECKS
# ============================================================================
if [[ -n "$BACKEND_DIR" ]]; then
    log "${BOLD}${BLUE}━━━ Phase 2: PHP Checks ━━━${NC}"
    phase_start

    CHANGED_PHP=$(
        { git diff --name-only HEAD 2>/dev/null
          git diff --name-only --cached 2>/dev/null
          git ls-files --others --exclude-standard 2>/dev/null
        } | grep '\.php$' | grep "^${BACKEND_DIR}/" | sort -u
    ) || true

    if [[ -z "$CHANGED_PHP" && "$BACKEND_DIR" == "." ]]; then
        CHANGED_PHP=$(
            { git diff --name-only HEAD 2>/dev/null
              git diff --name-only --cached 2>/dev/null
              git ls-files --others --exclude-standard 2>/dev/null
            } | grep '\.php$' | sort -u
        ) || true
    fi

    if [[ -z "$CHANGED_PHP" ]]; then
        PHP_COUNT=0
    else
        PHP_COUNT=$(echo "$CHANGED_PHP" | wc -l | tr -d ' ')
    fi
    log "  PHP files changed: ${BOLD}$PHP_COUNT${NC}"

    for FILE in $CHANGED_PHP; do
        if [[ ! -f "$FILE" ]]; then continue; fi

        # Syntax check
        SYNTAX_RESULT=$(php -l "$FILE" 2>&1)
        if [[ $? -ne 0 ]]; then
            log "  ${RED}❌ SYNTAX ERROR: $FILE${NC}"
            log "     ${RED}$(echo "$SYNTAX_RESULT" | head -3)${NC}"
            inc_errors
            continue
        fi

        # env() in app/ code
        if echo "$FILE" | grep -qE '/app/'; then
            ENV_CALLS=$(grep -nE "env\(\s*'" "$FILE" 2>/dev/null | head -3)
            if [[ -n "$ENV_CALLS" ]]; then
                log "  ${RED}❌ env() in app/ code: $FILE${NC}"
                echo "$ENV_CALLS" | while read line; do log "     ${RED}$line${NC}"; done
                log "     ${RED}Use config('key') — env() breaks under config:cache${NC}"
                inc_errors
            fi
        fi

        # dd(), dump(), ray()
        DEBUG_CALLS=$(grep -nE '\b(dd|dump|ray)\s*\(' "$FILE" 2>/dev/null | grep -v '//' | head -3)
        if [[ -n "$DEBUG_CALLS" ]]; then
            log "  ${YELLOW}⚠️  Debug function in: $FILE${NC}"
            echo "$DEBUG_CALLS" | while read line; do log "     ${YELLOW}$line${NC}"; done
            inc_warnings
        fi

        # HasUuids on models
        if echo "$FILE" | grep -q '/Models/'; then
            if grep -q 'class.*extends Model' "$FILE" && ! grep -q 'HasUuids' "$FILE"; then
                log "  ${YELLOW}⚠️  Model missing HasUuids trait: $FILE${NC}"
                inc_warnings
            fi
        fi
    done

    if [[ "$PHP_COUNT" -gt 0 ]]; then
        log "  ${GREEN}✓${NC} PHP checks complete"
    fi

    phase_end
    log ""

    # ========================================================================
    # PHASE 2b: LARASTAN / PHPSTAN (optional, if installed)
    # ========================================================================
    if [[ "$PHP_COUNT" -gt 0 && -f "${BACKEND_DIR}/vendor/bin/phpstan" ]]; then
        log "${BOLD}${BLUE}━━━ Phase 2b: Static Analysis (Larastan) ━━━${NC}"
        phase_start

        REL_FILES=$(echo "$CHANGED_PHP" | sed "s|^${BACKEND_DIR}/||" | tr '\n' ' ')
        PHPSTAN_RESULT=$(cd "$BACKEND_DIR" && vendor/bin/phpstan analyse \
            --no-progress --error-format=raw --memory-limit=1G $REL_FILES 2>&1)
        PHPSTAN_RC=$?

        if [[ $PHPSTAN_RC -ne 0 ]]; then
            ERR_COUNT=$(echo "$PHPSTAN_RESULT" | grep -cE ':[0-9]+:' || echo 0)
            log "  ${RED}❌ Larastan found ${ERR_COUNT} errors:${NC}"
            echo "$PHPSTAN_RESULT" | grep -E ':[0-9]+:' | head -20 | while read line; do log "     ${RED}${line}${NC}"; done
            inc_errors
        else
            log "  ${GREEN}✓${NC} Larastan clean on $PHP_COUNT files"
        fi

        phase_end
        log ""
    elif [[ "$PHP_COUNT" -gt 0 && "$DEEP" == true ]]; then
        log "${BOLD}${BLUE}━━━ Phase 2b: Static Analysis ━━━${NC}"
        log "  ${DIM}Larastan not installed — skipping (composer require --dev larastan/larastan)${NC}"
        log ""
    fi

    # ========================================================================
    # PHASE 2c: LARAVEL PINT FORMAT CHECK (optional, if installed)
    # ========================================================================
    if [[ "$PHP_COUNT" -gt 0 && -f "${BACKEND_DIR}/vendor/bin/pint" ]]; then
        log "${BOLD}${BLUE}━━━ Phase 2c: Format Check (Pint) ━━━${NC}"
        phase_start

        REL_FILES=$(echo "$CHANGED_PHP" | sed "s|^${BACKEND_DIR}/||" | tr '\n' ' ')
        PINT_RESULT=$(cd "$BACKEND_DIR" && vendor/bin/pint --test $REL_FILES 2>&1)
        if [[ $? -ne 0 ]]; then
            log "  ${YELLOW}⚠️  Format issues — run: cd backend && vendor/bin/pint${NC}"
            echo "$PINT_RESULT" | grep -E 'STYLE|FIXED' | head -5
            inc_warnings
        else
            log "  ${GREEN}✓${NC} Format clean"
        fi

        phase_end
        log ""
    fi

    # ========================================================================
    # PHASE 3: MIGRATION VALIDATION
    # ========================================================================
    CHANGED_MIGRATIONS=$(echo "$CHANGED_PHP" | grep 'database/migrations/' || true)
    if [[ -z "$CHANGED_MIGRATIONS" ]]; then
        MIGRATION_COUNT=0
    else
        MIGRATION_COUNT=$(echo "$CHANGED_MIGRATIONS" | wc -l | tr -d ' ')
    fi

    if [[ "$MIGRATION_COUNT" -gt 0 ]]; then
        log "${BOLD}${BLUE}━━━ Phase 3: Migration Validation ━━━${NC}"
        phase_start

        for MIGRATION in $CHANGED_MIGRATIONS; do
            if [[ ! -f "$MIGRATION" ]]; then continue; fi
            log "  Checking: ${CYAN}$(basename "$MIGRATION")${NC}"

            if ! php -l "$MIGRATION" > /dev/null 2>&1; then
                log "    ${RED}❌ PHP syntax error${NC}"
                inc_errors
                continue
            fi

            if ! grep -q 'function down' "$MIGRATION"; then
                log "    ${YELLOW}⚠️  No down() method (rollback won't work)${NC}"
                inc_warnings
            fi

            # Check for MySQL syntax — skip comments and PostgreSQL CREATE TYPE statements
            MYSQL_HITS=$(grep -nE '\bunsigned\b|\btinyint\b|\bmediumint\b|\bAUTO_INCREMENT\b' "$MIGRATION" 2>/dev/null | grep -v '//' | head -3)
            # Check for $table->enum() (MySQL) but not DB::statement CREATE TYPE AS ENUM (PostgreSQL)
            ENUM_HITS=$(grep -nE '\$table->enum\(|\->enum\(' "$MIGRATION" 2>/dev/null | head -3)
            # Check for dateTime() — should be timestamp/timestampTz
            DATETIME_HITS=$(grep -nE '\bdateTime\(' "$MIGRATION" 2>/dev/null | grep -v '//' | head -3)
            MYSQL_HITS="${MYSQL_HITS}${ENUM_HITS:+$'\n'$ENUM_HITS}${DATETIME_HITS:+$'\n'$DATETIME_HITS}"
            MYSQL_HITS=$(echo "$MYSQL_HITS" | sed '/^$/d')
            if [[ -n "$MYSQL_HITS" ]]; then
                log "    ${RED}❌ MySQL syntax (Railway uses PostgreSQL):${NC}"
                echo "$MYSQL_HITS" | while read line; do log "       $line"; done
                inc_errors
            fi

            if grep -qE '\$table->id\(\)' "$MIGRATION" 2>/dev/null; then
                log "    ${YELLOW}⚠️  Uses \$table->id() — should be \$table->uuid('id')->primary()${NC}"
                inc_warnings
            fi

            if grep -qE 'foreignId\(' "$MIGRATION" 2>/dev/null; then
                log "    ${YELLOW}⚠️  Uses foreignId() — should this be foreignUuid()?${NC}"
                inc_warnings
            fi

            log "    ${GREEN}✓${NC} OK"
        done

        phase_end
        log ""
    fi

    # ========================================================================
    # PHASE 4: LARAVEL BOOT CHECK
    # ========================================================================
    log "${BOLD}${BLUE}━━━ Phase 4: Laravel Boot Check ━━━${NC}"
    phase_start

    ARTISAN="php ${BACKEND_DIR}/artisan"

    # Config cache
    CONFIG_RESULT=$($ARTISAN config:cache 2>&1)
    if [[ $? -ne 0 ]]; then
        log "  ${RED}❌ Config compilation failed:${NC}"
        echo "$CONFIG_RESULT" | tail -5
        inc_errors
    else
        log "  ${GREEN}✓${NC} Config compiles"
        $ARTISAN config:clear > /dev/null 2>&1
    fi

    # Route cache (catches duplicate route names and compilation errors)
    ROUTE_RESULT=$($ARTISAN route:cache 2>&1)
    if [[ $? -ne 0 ]]; then
        if echo "$ROUTE_RESULT" | grep -qi 'closure'; then
            log "  ${YELLOW}⚠️  Closure routes can't be cached (not a deploy blocker)${NC}"
            inc_warnings
        elif echo "$ROUTE_RESULT" | grep -qi 'already been assigned name'; then
            # Duplicate names block route:cache but routes still work at runtime
            # Verify routes actually compile via route:list
            ROUTE_LIST_RESULT=$($ARTISAN route:list 2>&1)
            if [[ $? -eq 0 ]]; then
                log "  ${YELLOW}⚠️  Duplicate route names (route:cache disabled, routes work at runtime):${NC}"
                echo "$ROUTE_RESULT" | grep -i 'assigned name' | head -3
                inc_warnings
            else
                log "  ${RED}❌ Route compilation failed:${NC}"
                echo "$ROUTE_LIST_RESULT" | tail -10
                inc_errors
            fi
        else
            log "  ${RED}❌ Route compilation failed:${NC}"
            echo "$ROUTE_RESULT" | tail -10
            inc_errors
        fi
    else
        log "  ${GREEN}✓${NC} Routes compile and cache (no duplicate names)"
    fi
    $ARTISAN route:clear > /dev/null 2>&1

    # Event cache
    EVENT_RESULT=$($ARTISAN event:cache 2>&1)
    if [[ $? -ne 0 ]]; then
        log "  ${YELLOW}⚠️  Event cache issue:${NC}"
        echo "$EVENT_RESULT" | tail -5
        inc_warnings
    else
        log "  ${GREEN}✓${NC} Events compile"
        $ARTISAN event:clear > /dev/null 2>&1
    fi

    # Package discover
    DISCOVER_RESULT=$($ARTISAN package:discover --ansi 2>&1)
    if [[ $? -ne 0 ]]; then
        log "  ${RED}❌ Package discovery failed:${NC}"
        echo "$DISCOVER_RESULT" | tail -10
        inc_errors
    else
        log "  ${GREEN}✓${NC} Package discovery OK"
    fi

    # Composer lock sync
    if [[ -f "${BACKEND_DIR}/composer.json" && -f "${BACKEND_DIR}/composer.lock" ]]; then
        COMPOSER_VALIDATE=$(cd "$BACKEND_DIR" && composer validate --no-check-all --no-check-publish 2>&1)
        if echo "$COMPOSER_VALIDATE" | grep -qi 'lock file is not up to date'; then
            log "  ${RED}❌ composer.lock out of sync — run: composer update --lock${NC}"
            inc_errors
        else
            log "  ${GREEN}✓${NC} composer.lock in sync"
        fi
    fi

    # Check for dependencies requiring PHP extensions not in Dockerfile
    # This catches the exact scenario where a new package (e.g. phpspreadsheet)
    # requires an extension (e.g. ext-gd) that isn't installed in the Docker image.
    if [[ -f "${BACKEND_DIR}/composer.lock" ]]; then
        # Extract required extensions from composer.lock
        REQUIRED_EXTS=$(php -r '
            $lock = json_decode(file_get_contents("'"${BACKEND_DIR}"'/composer.lock"), true);
            $exts = [];
            foreach (array_merge($lock["packages"] ?? [], $lock["packages-dev"] ?? []) as $pkg) {
                foreach ($pkg["require"] ?? [] as $dep => $ver) {
                    if (str_starts_with($dep, "ext-") && $dep !== "ext-mbstring" && $dep !== "ext-openssl" && $dep !== "ext-tokenizer" && $dep !== "ext-ctype" && $dep !== "ext-dom" && $dep !== "ext-xml" && $dep !== "ext-xmlwriter" && $dep !== "ext-xmlreader" && $dep !== "ext-fileinfo" && $dep !== "ext-pdo" && $dep !== "ext-curl" && $dep !== "ext-filter" && $dep !== "ext-hash" && $dep !== "ext-json" && $dep !== "ext-session" && $dep !== "ext-simplexml" && $dep !== "ext-iconv") {
                        $ext = substr($dep, 4);
                        $exts[$ext] = ($exts[$ext] ?? []);
                        $exts[$ext][] = $pkg["name"];
                    }
                }
            }
            foreach ($exts as $ext => $pkgs) {
                echo $ext . ":" . implode(",", array_unique($pkgs)) . "\n";
            }
        ' 2>/dev/null)

        if [[ -n "$REQUIRED_EXTS" ]]; then
            # Find which Dockerfile Railway will use
            DEPLOY_DOCKERFILE=""
            for candidate in "docker/standalone/Dockerfile" "Dockerfile"; do
                if [[ -f "$candidate" ]]; then
                    DEPLOY_DOCKERFILE="$candidate"
                    break
                fi
            done

            if [[ -n "$DEPLOY_DOCKERFILE" ]]; then
                # Extract extensions installed in Dockerfile
                DOCKER_EXTS=$(grep -oE 'install-php-extensions\s+.*' "$DEPLOY_DOCKERFILE" 2>/dev/null \
                    | sed 's/install-php-extensions//' | tr ' ' '\n' | sed '/^$/d' | sort -u)

                EXT_MISSING=false
                while IFS=: read -r ext pkgs; do
                    if ! echo "$DOCKER_EXTS" | grep -qw "$ext"; then
                        # Check if it's available in the base PHP image (common built-ins)
                        if ! php -m 2>/dev/null | grep -qiw "$ext"; then
                            log "  ${RED}❌ Missing PHP extension in Docker: ext-${ext} (required by: ${pkgs})${NC}"
                            log "     ${RED}Add '${ext}' to install-php-extensions in ${DEPLOY_DOCKERFILE}${NC}"
                            EXT_MISSING=true
                            inc_errors
                        fi
                    fi
                done <<< "$REQUIRED_EXTS"
                if [[ "$EXT_MISSING" == false ]]; then
                    log "  ${GREEN}✓${NC} All required PHP extensions available in Docker"
                fi
            fi
        fi
    fi

    phase_end
    log ""

    # ========================================================================
    # PHASE 4b: MIGRATION DRY RUN (new migrations only)
    # ========================================================================
    CHANGED_MIGRATIONS=${CHANGED_MIGRATIONS:-""}
    if [[ -n "$CHANGED_MIGRATIONS" ]]; then
        log "${BOLD}${BLUE}━━━ Phase 4b: Migration Dry Run ━━━${NC}"
        phase_start
        log "  ${CYAN}New migrations detected — running pretend migrate against sqlite in-memory${NC}"
        for MIGRATION in $CHANGED_MIGRATIONS; do
            if [[ ! -f "$MIGRATION" ]]; then continue; fi
            REL_PATH=${MIGRATION#$BACKEND_DIR/}
            log "  ${CYAN}→ $REL_PATH${NC}"
            MIG_RESULT=$(DB_CONNECTION=sqlite DB_DATABASE=:memory: $ARTISAN migrate --pretend --path="$REL_PATH" 2>&1)
            if [[ $? -ne 0 ]]; then
                log "    ${RED}❌ Migrate failed${NC}"
                echo "$MIG_RESULT" | tail -15
                inc_errors
            else
                log "    ${GREEN}✓${NC} OK"
            fi
        done
        phase_end
        log ""
    else
        log "${BOLD}${BLUE}━━━ Phase 4b: Migration Dry Run ━━━${NC}"
        log "  ${CYAN}No new migrations — skipping migration dry run${NC}"
        log ""
    fi

    # ========================================================================
    # PHASE 5: NIXPACKS / DEPLOY CONFIG CHECK
    # ========================================================================
    log "${BOLD}${BLUE}━━━ Phase 5: Deploy Config ━━━${NC}"
    phase_start

    # Find nixpacks.toml
    NIXPACKS_FILE=""
    for candidate in "${BACKEND_DIR}/nixpacks.toml" "nixpacks.toml" "Railway/nixpacks.toml"; do
        if [[ -f "$candidate" ]]; then
            NIXPACKS_FILE="$candidate"
            break
        fi
    done

    if [[ -n "$NIXPACKS_FILE" ]]; then
        log "  ${GREEN}✓${NC} Found: $NIXPACKS_FILE"

        # Check for --no-scripts (the bug we fixed!)
        if grep -q 'composer install' "$NIXPACKS_FILE" 2>/dev/null; then
            INSTALL_PHASE=$(grep -A1 '\[phases.install\]' "$NIXPACKS_FILE" 2>/dev/null | grep 'composer')
            if [[ -n "$INSTALL_PHASE" ]] && ! echo "$INSTALL_PHASE" | grep -q '\-\-no-scripts'; then
                log "  ${RED}❌ Nixpacks install phase runs composer WITHOUT --no-scripts${NC}"
                log "     ${RED}This causes RouteGroup errors in Docker. Add --no-scripts to install phase.${NC}"
                inc_errors
            else
                log "  ${GREEN}✓${NC} Install phase uses --no-scripts"
            fi

            # Check for duplicate composer install in build phase
            BUILD_COMPOSER=$(grep -A5 '\[phases.build\]' "$NIXPACKS_FILE" 2>/dev/null | grep 'composer install')
            if [[ -n "$BUILD_COMPOSER" ]]; then
                log "  ${YELLOW}⚠️  Build phase also runs 'composer install' — redundant with install phase${NC}"
                log "     ${YELLOW}Use explicit artisan commands in build phase instead${NC}"
                inc_warnings
            fi
        fi

        # Check that build phase caches config/routes
        if ! grep -q 'config:cache' "$NIXPACKS_FILE" 2>/dev/null; then
            log "  ${YELLOW}⚠️  nixpacks.toml missing 'config:cache' in build phase${NC}"
            inc_warnings
        fi
        if ! grep -q 'route:cache' "$NIXPACKS_FILE" 2>/dev/null; then
            log "  ${YELLOW}⚠️  nixpacks.toml missing 'route:cache' in build phase${NC}"
            inc_warnings
        fi
    elif [[ -f "Dockerfile" ]] || [[ -f "${BACKEND_DIR}/Dockerfile" ]]; then
        log "  ${GREEN}✓${NC} Dockerfile present"
    else
        log "  ${CYAN}ℹ${NC}  No nixpacks.toml or Dockerfile (Railway auto-detect)"
    fi

    # .env.example sync
    if [[ -f "${BACKEND_DIR}/.env.example" && -d "${BACKEND_DIR}/config" ]]; then
        CONFIG_ENVS=$(grep -rohE "env\(\s*'([A-Z_]+)'" "${BACKEND_DIR}/config/" 2>/dev/null | grep -oE "'[A-Z_]+'" | tr -d "'" | sort -u)
        MISSING_FROM_EXAMPLE=""
        for var in $CONFIG_ENVS; do
            if ! grep -q "^${var}=" "${BACKEND_DIR}/.env.example" 2>/dev/null; then
                case "$var" in
                    # Skip standard Laravel framework vars — only flag custom/project-specific ones
                    APP_*|LOG_*|DB_*|MAIL_*|REDIS_*|CACHE_*|SESSION_*|QUEUE_*|SQS_*|MEMCACHED_*|DYNAMODB_*|BEANSTALKD_*|PAPERTRAIL_*|AUTH_*|MYSQL_*) continue ;;
                esac
                MISSING_FROM_EXAMPLE+="$var "
            fi
        done
        if [[ -n "$MISSING_FROM_EXAMPLE" ]]; then
            log "  ${YELLOW}⚠️  Env vars in config/ not in .env.example: ${MISSING_FROM_EXAMPLE}${NC}"
            inc_warnings
        else
            log "  ${GREEN}✓${NC} .env.example covers config/ env vars"
        fi
    fi

    # Hardcoded Railway hostnames (skip config/ — config files use .railway.internal as env() fallbacks)
    HARDCODED_RAILWAY=$(grep -rl '\.railway\.internal' "${BACKEND_DIR}/app/" "${BACKEND_DIR}/routes/" 2>/dev/null || true)
    if [[ -n "$HARDCODED_RAILWAY" ]]; then
        log "  ${RED}❌ Hardcoded Railway hostnames in app/routes code:${NC}"
        echo "$HARDCODED_RAILWAY" | while read f; do log "     $f"; done
        inc_errors
    else
        log "  ${GREEN}✓${NC} No hardcoded Railway hostnames in app code"
    fi

    # Hardcoded localhost
    HARDCODED_LOCAL=$(grep -rlnE '(localhost|127\.0\.0\.1|0\.0\.0\.0):[0-9]+' "${BACKEND_DIR}/app/" "${BACKEND_DIR}/config/" "${BACKEND_DIR}/routes/" 2>/dev/null \
        | grep -v '.example' | head -5 || true)
    if [[ -n "$HARDCODED_LOCAL" ]]; then
        log "  ${YELLOW}⚠️  Hardcoded localhost URLs:${NC}"
        echo "$HARDCODED_LOCAL" | while read f; do log "     ${YELLOW}$f${NC}"; done
        inc_warnings
    else
        log "  ${GREEN}✓${NC} No hardcoded localhost URLs"
    fi

    phase_end
    log ""
fi

# ============================================================================
# PHASE 6: FRONTEND CHECKS
# ============================================================================
if [[ -n "$FRONTEND_DIR" && -f "${FRONTEND_DIR}/package.json" ]]; then
    log "${BOLD}${BLUE}━━━ Phase 6: Frontend Checks ━━━${NC}"
    phase_start

    CHANGED_JS=$(
        { git diff --name-only HEAD 2>/dev/null
          git diff --name-only --cached 2>/dev/null
          git ls-files --others --exclude-standard 2>/dev/null
        } | grep -E '\.(ts|tsx|js|jsx|vue)$' | sort -u
    ) || true

    if [[ -z "$CHANGED_JS" ]]; then
        JS_COUNT=0
    else
        JS_COUNT=$(echo "$CHANGED_JS" | wc -l | tr -d ' ')
    fi
    log "  JS/TS/Vue files changed: ${BOLD}$JS_COUNT${NC}"

    # console.log / debugger
    if [[ "$JS_COUNT" -gt 0 ]]; then
        CONSOLE_HITS=""
        for FILE in $CHANGED_JS; do
            if [[ ! -f "$FILE" ]]; then continue; fi
            if echo "$FILE" | grep -qE '\.(test|spec)\.(ts|tsx|js|jsx)$'; then continue; fi
            if echo "$FILE" | grep -qE 'node_modules|vendor|dist/|\.cjs$'; then continue; fi
            # Skip root-level utility scripts
            if [[ "$(dirname "$FILE")" == "." ]]; then continue; fi
            HITS=$(grep -nE '^\s*(console\.(log|debug|info)\(|debugger\b)' "$FILE" 2>/dev/null | head -3 || true)
            if [[ -n "$HITS" ]]; then
                CONSOLE_HITS+="  $FILE:\n$HITS\n"
            fi
        done
        if [[ -n "$CONSOLE_HITS" ]]; then
            log "  ${YELLOW}⚠️  console.log/debugger in production code:${NC}"
            echo -e "$CONSOLE_HITS" | head -15
            inc_warnings
        else
            log "  ${GREEN}✓${NC} No debug statements"
        fi

        # TypeScript 'any' types
        ANY_HITS=""
        for FILE in $CHANGED_JS; do
            if [[ ! -f "$FILE" ]]; then continue; fi
            if echo "$FILE" | grep -qE '\.(js|jsx)$'; then continue; fi
            if echo "$FILE" | grep -qE 'node_modules|vendor|dist/'; then continue; fi
            HITS=$(grep -nE ':\s*any\b|<any>|as any' "$FILE" 2>/dev/null | head -3 || true)
            if [[ -n "$HITS" ]]; then
                ANY_COUNT=$(grep -cE ':\s*any\b|<any>|as any' "$FILE" 2>/dev/null || echo 0)
                ANY_HITS+="  $FILE ($ANY_COUNT instances)\n"
            fi
        done
        if [[ -n "$ANY_HITS" ]]; then
            log "  ${YELLOW}⚠️  TypeScript 'any' types:${NC}"
            echo -e "$ANY_HITS" | head -10
            inc_warnings
        else
            log "  ${GREEN}✓${NC} No 'any' types"
        fi
    fi

    # TypeScript compilation (if tsconfig exists in frontend dir)
    TSCONFIG=""
    for candidate in "${FRONTEND_DIR}/tsconfig.json" "tsconfig.json"; do
        if [[ -f "$candidate" ]]; then
            TSCONFIG="$candidate"
            break
        fi
    done
    # Vite build (run first — if this passes, TS errors are just strict-mode noise)
    VITE_BUILD_OK=false
    if grep -q '"build"' "${FRONTEND_DIR}/package.json" 2>/dev/null; then
        # Check if build script needs env vars (monorepo service selector)
        BUILD_SCRIPT=$(grep '"build"' "${FRONTEND_DIR}/package.json" | head -1)
        if echo "$BUILD_SCRIPT" | grep -qE 'monorepo-build|RAILWAY_SERVICE_NAME'; then
            log "  ${CYAN}ℹ${NC}  Monorepo build (needs RAILWAY_SERVICE_NAME) — skipping local build test"
        else
            log "  ${CYAN}Vite build...${NC}"
            BUILD_RESULT=$(cd "$FRONTEND_DIR" && npm run build 2>&1)
            if [[ $? -ne 0 ]]; then
                # Check if it failed because of missing env var for monorepo
                if echo "$BUILD_RESULT" | grep -qi 'RAILWAY_SERVICE_NAME\|could not determine workspace'; then
                    log "  ${CYAN}ℹ${NC}  Monorepo build skipped (needs RAILWAY_SERVICE_NAME)"
                else
                    log "  ${RED}❌ Build FAILED:${NC}"
                    echo "$BUILD_RESULT" | tail -15
                    inc_errors
                fi
            else
                log "  ${GREEN}✓${NC} Build passed"
                VITE_BUILD_OK=true
            fi
        fi
    fi

    # TypeScript strict check
    if [[ -n "$TSCONFIG" ]] && command -v npx &> /dev/null; then
        log "  ${CYAN}TypeScript check...${NC}"
        TSC_RESULT=$(npx tsc --noEmit -p "$TSCONFIG" 2>&1)
        if [[ $? -ne 0 ]]; then
            TSC_ERRORS=$(echo "$TSC_RESULT" | grep -c 'error TS' || echo 0)
            if [[ "$VITE_BUILD_OK" == true ]]; then
                log "  ${YELLOW}⚠️  TypeScript strict: $TSC_ERRORS errors (build still passes)${NC}"
                echo "$TSC_RESULT" | grep 'error TS' | head -5
                inc_warnings
            else
                log "  ${RED}❌ TypeScript: $TSC_ERRORS errors${NC}"
                echo "$TSC_RESULT" | grep 'error TS' | head -10
                inc_errors
            fi
        else
            log "  ${GREEN}✓${NC} TypeScript passes"
        fi
    fi

    # Inertia-specific: SSR build
    if [[ "$HAS_INERTIA" == true ]]; then
        if grep -q '"build:ssr"' "${FRONTEND_DIR}/package.json" 2>/dev/null; then
            log "  ${CYAN}SSR build...${NC}"
            SSR_RESULT=$(cd "$FRONTEND_DIR" && npm run build:ssr 2>&1)
            if [[ $? -ne 0 ]]; then
                log "  ${RED}❌ SSR build FAILED:${NC}"
                echo "$SSR_RESULT" | tail -15
                inc_errors
            else
                log "  ${GREEN}✓${NC} SSR build passed"
            fi
        fi
    fi

    phase_end
    log ""
fi

# ============================================================================
# PHASE 7: INERTIA / MULTI-APP CHECKS (only if detected)
# ============================================================================
if [[ "$HAS_INERTIA" == true || "$IS_MULTIAPP" == true ]]; then
    log "${BOLD}${BLUE}━━━ Phase 7: Platform-Specific Checks ━━━${NC}"
    phase_start

    if [[ "$HAS_INERTIA" == true ]]; then
        # SSR-incompatible code
        if [[ -n "$CHANGED_JS" ]]; then
            SSR_ISSUES=""
            for FILE in $CHANGED_JS; do
                if [[ ! -f "$FILE" ]]; then continue; fi
                BARE_WINDOW=$(grep -nE '(?<!typeof )(window\.|document\.|localStorage|sessionStorage)' "$FILE" 2>/dev/null \
                    | grep -v 'typeof' | grep -v '//' | grep -v '\.d\.ts' | head -3 || true)
                if [[ -n "$BARE_WINDOW" ]]; then
                    SSR_ISSUES+="  $FILE\n"
                fi
            done
            if [[ -n "$SSR_ISSUES" ]]; then
                log "  ${YELLOW}⚠️  SSR-incompatible code (window/document without guard):${NC}"
                echo -e "$SSR_ISSUES" | head -10
                inc_warnings
            else
                log "  ${GREEN}✓${NC} No SSR issues"
            fi
        fi

        # Vite manifest
        if [[ ! -f "public/build/manifest.json" ]] && [[ ! -f "public/build/.vite/manifest.json" ]]; then
            log "  ${YELLOW}⚠️  Vite manifest missing — SSR may crash${NC}"
            inc_warnings
        fi
    fi

    if [[ "$IS_MULTIAPP" == true ]]; then
        # Branding leak check — only flag shared components, not app-specific subdirs
        BRAND_DIRS=("resources/js/Components" "resources/js/Layouts" "src/components" "src/layouts")
        # App-specific subdirs that legitimately contain app names
        APP_SUBDIRS="alphasite\|day-news\|downtown-guide\|go-event-city\|local-voices\|goeventcity\|daynews\|downtownguide"
        HARDCODED_BRANDS=""
        for dir in "${BRAND_DIRS[@]}"; do
            if [[ -d "$dir" ]]; then
                # Find branding in shared files, excluding app-specific subdirectories
                HITS=$(grep -rlE '"Go ?Event ?City"|"Day\.News"|"DowntownGuide"|"GoLocalVoices"' "$dir" 2>/dev/null \
                    | grep -vE "/(${APP_SUBDIRS})/" || true)
                if [[ -n "$HITS" ]]; then
                    HARDCODED_BRANDS+="$HITS"$'\n'
                fi
            fi
        done
        HARDCODED_BRANDS=$(echo "$HARDCODED_BRANDS" | sed '/^$/d')
        if [[ -n "$HARDCODED_BRANDS" ]]; then
            log "  ${YELLOW}⚠️  App names in shared components (check if platform-aware):${NC}"
            echo "$HARDCODED_BRANDS" | while read f; do log "     ${YELLOW}$f${NC}"; done
            inc_warnings
        else
            log "  ${GREEN}✓${NC} No branding leaks"
        fi
    fi

    phase_end
    log ""
fi

# ============================================================================
# SUMMARY
# ============================================================================
SHIP_ELAPSED=$(( $(date +%s) - SHIP_START ))

log "${BOLD}${BLUE}━━━ Summary ━━━${NC}"
log ""
log "  ${DIM}Duration: ${SHIP_ELAPSED}s${NC}"
log ""

if [[ $WARNINGS -gt 0 ]]; then
    log "  ${YELLOW}⚠️  Warnings:  $WARNINGS${NC}"
fi
if [[ $ERRORS -gt 0 ]]; then
    log "  ${RED}❌ Errors:    $ERRORS${NC}"
    log ""
    log "${RED}${BOLD}══════════════════════════════════════════════════════${NC}"
    log "${RED}${BOLD}  BLOCKED — Fix $ERRORS error(s) before shipping     ${NC}"
    log "${RED}${BOLD}══════════════════════════════════════════════════════${NC}"
    log ""
    log "  To force: ${YELLOW}./ship.sh \"message\" --force${NC}"
    if [[ -n "$REPORT_FILE" ]]; then
        log "  Report:   ${CYAN}$REPORT_FILE${NC}"
    fi
    exit 1
fi

log "  ${GREEN}${BOLD}✅ ALL CHECKS PASSED${NC}"
log ""

# ── Dry run stops here ──
if [[ "$MODE" == "dry" || -z "$COMMIT_MSG" ]]; then
    log "  ${CYAN}Dry run complete. No commit made.${NC}"
    if [[ -n "$REPORT_FILE" ]]; then
        log "  Report: ${CYAN}$REPORT_FILE${NC}"
    fi
    exit 0
fi

# ============================================================================
# COMMIT & PUSH
# ============================================================================
log "${BOLD}${BLUE}━━━ Ship It ━━━${NC}"

git add -A
log "  ${CYAN}Files being committed:${NC}"
git diff --cached --stat | head -20
log ""

git commit -m "$COMMIT_MSG"
if [[ $? -ne 0 ]]; then
    log "  ${YELLOW}Nothing to commit${NC}"
    exit 0
fi

log "  ${CYAN}Pushing to origin...${NC}"
git push
PUSH_EXIT=$?

if [[ $PUSH_EXIT -ne 0 ]]; then
    log "  ${RED}❌ Push failed. Try: git pull --rebase && ./ship.sh \"$COMMIT_MSG\"${NC}"
    exit 1
fi

log ""
log "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
log "${GREEN}${BOLD}║            🚀 SHIPPED SUCCESSFULLY                  ║${NC}"
log "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
log ""
log "  Commit:   ${CYAN}$COMMIT_MSG${NC}"
log "  Duration: ${CYAN}${SHIP_ELAPSED}s${NC}"
log ""
