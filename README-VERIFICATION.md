# Command Center Verification Guide

This document describes the verification system for the Command Center project.

## Quick Start

```bash
# Run all verifications
npm run verify

# Run full implementation verification
npm run verify:full

# Run quick dev checks
npm run verify:dev

# Run extended checks
npm run verify:extended
```

## Verification Scripts

### Basic Verification (`npm run verify`)

Runs all basic verification checks:
- ✅ Structure verification
- ✅ TypeScript type checking
- ✅ Component verification
- ✅ Service verification
- ✅ Routing verification
- ✅ Test setup verification
- ✅ Build verification
- ✅ E2E setup verification

### Full Implementation Verification (`npm run verify:full`)

Comprehensive verification based on CC-VERIFY-01:
- File structure (all required files)
- Component implementation
- Service implementation
- Hook implementation
- Routing configuration
- Integration points
- TypeScript types
- UI/UX features
- Test setup
- Build process

### Development Verification (`npm run verify:dev`)

Quick checks for developers:
- File structure
- TypeScript types (non-blocking)
- Components
- Services
- Routing

**Use this during development** for quick feedback without running full build.

### Extended Verification (`npm run verify:extended`)

Additional quality checks:
- No console.logs in production code
- Proper module exports
- No TODO comments in critical files
- Environment variables documented
- Error boundaries implemented
- Loading states implemented
- Accessibility attributes
- TypeScript strict mode

## CI/CD Integration

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/verify.yml`) that runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

The workflow:
1. Tests on Node.js 18.x and 20.x
2. Runs all verification checks
3. Runs linter and tests
4. Builds the project
5. Uploads build artifacts

### Local CI Simulation

To simulate CI locally:

```bash
# Install dependencies (like CI)
npm ci

# Run all checks
npm run verify:full

# Run tests
npm run test:run

# Build
npm run build
```

## Pre-commit Hooks

### Setup Husky

```bash
# Install husky (if not already installed)
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run verify:dev"
```

### Pre-commit Checks

The pre-commit hook runs:
- Structure verification
- TypeScript type checking (warns, doesn't fail)
- Component verification
- Service verification
- Routing verification

**Note:** TypeScript errors won't block commits but will show warnings.

### Pre-push Checks

The pre-push hook runs:
- Full implementation verification
- Test suite

**Note:** Tests can fail without blocking push (warning only).

## Individual Verification Commands

```bash
# Structure only
npm run verify:structure

# TypeScript only
npm run verify:types

# Components only
npm run verify:components

# Services only
npm run verify:services

# Routing only
npm run verify:routing

# Tests only
npm run verify:tests

# Build only
npm run verify:build

# E2E setup only
npm run verify:e2e
```

## Integration Examples

### VS Code Tasks

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Verify Command Center",
      "type": "shell",
      "command": "npm run verify:dev",
      "problemMatcher": [],
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

### Git Hooks (Manual)

If not using Husky, add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
npm run verify:dev
```

### Makefile

Add to `Makefile`:

```makefile
.PHONY: verify
verify:
	npm run verify:full

.PHONY: verify-dev
verify-dev:
	npm run verify:dev

.PHONY: verify-ci
verify-ci:
	npm ci
	npm run verify:full
	npm run test:run
	npm run build
```

## Troubleshooting

### Verification Fails

1. **Structure errors**: Check that all required files exist
2. **Type errors**: Run `npx tsc --noEmit` to see detailed errors
3. **Component errors**: Check exports and imports
4. **Build errors**: Check dependencies are installed (`npm install`)

### Pre-commit Hook Not Running

1. Ensure Husky is installed: `npm install --save-dev husky`
2. Initialize Husky: `npx husky install`
3. Check hook exists: `ls -la .husky/pre-commit`
4. Make hook executable: `chmod +x .husky/pre-commit`

### CI/CD Failures

1. Check Node.js version matches workflow
2. Ensure all dependencies are in `package.json`
3. Check build output for specific errors
4. Review GitHub Actions logs

## Best Practices

1. **Run `verify:dev` before committing** - Quick feedback
2. **Run `verify:full` before pushing** - Comprehensive check
3. **Fix TypeScript errors** - Even if they don't block commits
4. **Keep verification scripts updated** - Add new checks as needed
5. **Document new requirements** - Update verification scripts

## Extending Verification

To add new checks:

1. Create a new script in `scripts/verify/`
2. Add npm script to `package.json`
3. Add to `scripts/verify/index.js` for full verification
4. Update this README

Example:

```javascript
// scripts/verify/custom-check.js
import { existsSync } from 'fs';

function verifyCustom() {
  // Your check logic
  if (existsSync('custom-file.ts')) {
    console.log('✅ Custom check passed');
    process.exit(0);
  } else {
    console.log('❌ Custom check failed');
    process.exit(1);
  }
}

verifyCustom();
```

## Success Criteria

A successful verification should show:
- ✅ All critical checks passed
- ⚠️  Warnings are acceptable (non-blocking)
- ❌ No failed checks
- Success rate: 100% for critical checks

## Support

For issues with verification:
1. Check this README
2. Review script output for specific errors
3. Check GitHub Actions logs (if CI/CD)
4. Consult CC-VERIFY-01-IMPLEMENTATION.md for detailed requirements

