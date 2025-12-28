#!/bin/bash

# Platform Scanning Script
# Scans a platform for vulnerabilities, code quality, and dependencies

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PLATFORM="${1:-learning-center}"
SCAN_TYPE="${2:-all}"

# Platform directory mapping function
get_platform_dir() {
    local platform=$1
    case "$platform" in
        learning-center)
            echo "/Users/johnshine/Dropbox/Fibonacco/Learning-Center"
            ;;
        task-juggler)
            echo "TBD"
            ;;
        publishing)
            echo "TBD"
            ;;
        marketing)
            echo "TBD"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Results directory (use absolute path based on script location)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="$PROJECT_ROOT/scan-results/$PLATFORM"
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Scanning Platform: $PLATFORM${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get platform directory
PLATFORM_DIR=$(get_platform_dir "$PLATFORM")

if [ "$PLATFORM_DIR" = "TBD" ] || [ -z "$PLATFORM_DIR" ]; then
    echo -e "${RED}❌ Platform location not configured: $PLATFORM${NC}"
    echo "Please update PLATFORM_SCANNING_FRAMEWORK.md with the platform directory"
    exit 1
fi

if [ ! -d "$PLATFORM_DIR" ]; then
    echo -e "${RED}❌ Platform directory not found: $PLATFORM_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Platform directory: $PLATFORM_DIR${NC}"
echo ""

cd "$PLATFORM_DIR"

# Function to run dependency scan
scan_dependencies() {
    echo -e "${BLUE}📦 Running Dependency Vulnerability Scan...${NC}"
    
    # Frontend (npm)
    if [ -f "package.json" ]; then
        echo "  Scanning npm dependencies..."
        npm audit --json > "$RESULTS_DIR/dependency-npm.json" 2>&1 || true
        npm audit --audit-level=moderate > "$RESULTS_DIR/dependency-npm.txt" 2>&1 || true
        echo -e "${GREEN}  ✅ npm audit complete${NC}"
    else
        echo -e "${YELLOW}  ⚠️  No package.json found${NC}"
    fi
    
    # Return to original directory for relative paths
    cd "$PLATFORM_DIR"
    
    # Backend (composer)
    if [ -f "backend/composer.json" ] || [ -f "composer.json" ]; then
        COMPOSER_FILE=""
        if [ -f "backend/composer.json" ]; then
            COMPOSER_FILE="backend/composer.json"
            cd backend
        elif [ -f "composer.json" ]; then
            COMPOSER_FILE="composer.json"
        fi
        
        if [ -n "$COMPOSER_FILE" ]; then
            echo "  Scanning composer dependencies..."
            # Check if composer audit is available (PHP 8.3+)
            if composer audit --help &>/dev/null; then
                if [ -f "backend/composer.json" ]; then
                    composer audit --json > "$RESULTS_DIR/dependency-composer.json" 2>&1 || true
                    composer audit > "$RESULTS_DIR/dependency-composer.txt" 2>&1 || true
                    cd ..
                else
                    composer audit --json > "$RESULTS_DIR/dependency-composer.json" 2>&1 || true
                    composer audit > "$RESULTS_DIR/dependency-composer.txt" 2>&1 || true
                fi
                echo -e "${GREEN}  ✅ composer audit complete${NC}"
            else
                echo -e "${YELLOW}  ⚠️  composer audit not available (requires Composer 2.4+)${NC}"
                if [ -f "backend/composer.json" ]; then
                    cd ..
                fi
            fi
        fi
    else
        echo -e "${YELLOW}  ⚠️  No composer.json found${NC}"
    fi
    
    echo ""
}

# Function to run security scan
scan_security() {
    echo -e "${BLUE}🔒 Running Security Scan...${NC}"
    
    # npm audit (security vulnerabilities)
    if [ -f "package.json" ]; then
        echo "  Running npm audit (security focus)..."
        npm audit --audit-level=moderate --json > "$RESULTS_DIR/security-npm.json" 2>&1 || true
        echo -e "${GREEN}  ✅ npm security audit complete${NC}"
    fi
    
    # Snyk scan (if available)
    if command -v snyk &> /dev/null; then
        echo "  Running Snyk scan..."
        snyk test --json > "$RESULTS_DIR/security-snyk.json" 2>&1 || true
        snyk test > "$RESULTS_DIR/security-snyk.txt" 2>&1 || true
        echo -e "${GREEN}  ✅ Snyk scan complete${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Snyk not installed (optional)${NC}"
        echo "    Install with: npm install -g snyk"
    fi
    
    echo ""
}

# Function to run code quality scan
scan_quality() {
    echo -e "${BLUE}✨ Running Code Quality Scan...${NC}"
    
    # ESLint
    if [ -f "package.json" ]; then
        if grep -q "eslint" package.json; then
            echo "  Running ESLint..."
            npm run lint -- --format json > "$RESULTS_DIR/quality-eslint.json" 2>&1 || true
            npm run lint > "$RESULTS_DIR/quality-eslint.txt" 2>&1 || true
            echo -e "${GREEN}  ✅ ESLint complete${NC}"
        else
            echo -e "${YELLOW}  ⚠️  ESLint not configured${NC}"
        fi
    fi
    
    # TypeScript
    if [ -f "tsconfig.json" ]; then
        echo "  Running TypeScript type check..."
        npx tsc --noEmit --pretty false > "$RESULTS_DIR/quality-typescript.txt" 2>&1 || true
        echo -e "${GREEN}  ✅ TypeScript check complete${NC}"
    fi
    
    # PHP static analysis (if available)
    if [ -d "backend" ] && [ -f "backend/composer.json" ]; then
        cd backend
        if grep -q "phpstan\|psalm" composer.json; then
            echo "  Running PHP static analysis..."
            if grep -q "phpstan" composer.json && [ -f "vendor/bin/phpstan" ]; then
                vendor/bin/phpstan analyse --error-format=json > "$RESULTS_DIR/quality-phpstan.json" 2>&1 || true
                vendor/bin/phpstan analyse > "$RESULTS_DIR/quality-phpstan.txt" 2>&1 || true
                echo -e "${GREEN}  ✅ PHPStan complete${NC}"
            fi
            if grep -q "psalm" composer.json && [ -f "vendor/bin/psalm" ]; then
                vendor/bin/psalm --output-format=json > "$RESULTS_DIR/quality-psalm.json" 2>&1 || true
                vendor/bin/psalm > "$RESULTS_DIR/quality-psalm.txt" 2>&1 || true
                echo -e "${GREEN}  ✅ Psalm complete${NC}"
            fi
        fi
        cd ..
    fi
    
    echo ""
}

# Function to generate summary
generate_summary() {
    echo -e "${BLUE}📊 Generating Scan Summary...${NC}"
    
    SUMMARY_FILE="$RESULTS_DIR/summary.md"
    
    cat > "$SUMMARY_FILE" <<EOF
# Scan Summary: $PLATFORM

**Date:** $(date)
**Platform:** $PLATFORM
**Directory:** $PLATFORM_DIR

---

## Dependency Scan Results

EOF

    # npm audit summary
    if [ -f "$RESULTS_DIR/dependency-npm.json" ]; then
        VULNERABILITIES=$(cat "$RESULTS_DIR/dependency-npm.json" | grep -o '"vulnerabilities":{[^}]*}' | wc -l || echo "0")
        echo "### npm Dependencies" >> "$SUMMARY_FILE"
        echo "- Scan completed" >> "$SUMMARY_FILE"
        echo "- See: dependency-npm.json for details" >> "$SUMMARY_FILE"
        echo "" >> "$SUMMARY_FILE"
    fi
    
    # composer audit summary
    if [ -f "$RESULTS_DIR/dependency-composer.json" ]; then
        echo "### Composer Dependencies" >> "$SUMMARY_FILE"
        echo "- Scan completed" >> "$SUMMARY_FILE"
        echo "- See: dependency-composer.json for details" >> "$SUMMARY_FILE"
        echo "" >> "$SUMMARY_FILE"
    fi
    
    cat >> "$SUMMARY_FILE" <<EOF

## Security Scan Results

EOF

    # Snyk summary
    if [ -f "$RESULTS_DIR/security-snyk.json" ]; then
        echo "### Snyk Security Scan" >> "$SUMMARY_FILE"
        echo "- Scan completed" >> "$SUMMARY_FILE"
        echo "- See: security-snyk.json for details" >> "$SUMMARY_FILE"
        echo "" >> "$SUMMARY_FILE"
    fi
    
    cat >> "$SUMMARY_FILE" <<EOF

## Code Quality Results

EOF

    # ESLint summary
    if [ -f "$RESULTS_DIR/quality-eslint.json" ]; then
        ERRORS=$(cat "$RESULTS_DIR/quality-eslint.json" | grep -o '"errorCount":[0-9]*' | grep -o '[0-9]*' | head -1 || echo "0")
        WARNINGS=$(cat "$RESULTS_DIR/quality-eslint.json" | grep -o '"warningCount":[0-9]*' | grep -o '[0-9]*' | head -1 || echo "0")
        echo "### ESLint" >> "$SUMMARY_FILE"
        echo "- Errors: $ERRORS" >> "$SUMMARY_FILE"
        echo "- Warnings: $WARNINGS" >> "$SUMMARY_FILE"
        echo "- See: quality-eslint.json for details" >> "$SUMMARY_FILE"
        echo "" >> "$SUMMARY_FILE"
    fi
    
    # TypeScript summary
    if [ -f "$RESULTS_DIR/quality-typescript.txt" ]; then
        ERRORS=$(grep -c "error TS" "$RESULTS_DIR/quality-typescript.txt" 2>/dev/null || echo "0")
        echo "### TypeScript" >> "$SUMMARY_FILE"
        echo "- Type errors: $ERRORS" >> "$SUMMARY_FILE"
        echo "- See: quality-typescript.txt for details" >> "$SUMMARY_FILE"
        echo "" >> "$SUMMARY_FILE"
    fi
    
    echo -e "${GREEN}✅ Summary generated: $SUMMARY_FILE${NC}"
    echo ""
}

# Main execution
case "$SCAN_TYPE" in
    dependency)
        scan_dependencies
        ;;
    security)
        scan_security
        ;;
    quality)
        scan_quality
        ;;
    all)
        scan_dependencies
        scan_security
        scan_quality
        ;;
    *)
        echo -e "${RED}❌ Unknown scan type: $SCAN_TYPE${NC}"
        echo "Usage: $0 <platform> [dependency|security|quality|all]"
        exit 1
        ;;
esac

generate_summary

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Scan Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Results saved to: $RESULTS_DIR"
echo "📝 Summary: $RESULTS_DIR/summary.md"
echo ""
