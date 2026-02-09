#!/usr/bin/env node

/**
 * Development Verification Script
 * Quick checks for developers during development
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

const checks = [
  {
    name: 'File Structure',
    command: 'npm run verify:structure',
    critical: true,
  },
  {
    name: 'TypeScript Types',
    command: 'npm run verify:types',
    critical: false,
  },
  {
    name: 'Components',
    command: 'npm run verify:components',
    critical: true,
  },
  {
    name: 'Services',
    command: 'npm run verify:services',
    critical: true,
  },
  {
    name: 'Routing',
    command: 'npm run verify:routing',
    critical: true,
  },
];

console.log('🚀 Development Verification\n');
console.log('Running quick checks for development...\n');

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

for (const check of checks) {
  try {
    execSync(check.command, {
      cwd: process.cwd(),
      stdio: 'pipe',
    });
    results.passed.push(check.name);
    console.log(`✅ ${check.name}`);
  } catch (error) {
    if (check.critical) {
      results.failed.push(check.name);
      console.log(`❌ ${check.name} (CRITICAL)`);
    } else {
      results.warnings.push(check.name);
      console.log(`⚠️  ${check.name} (WARNING)`);
    }
  }
}

console.log('\n' + '='.repeat(50));
console.log('📊 Summary:\n');
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);
console.log(`❌ Failed: ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log('\n❌ Critical checks failed. Please fix before continuing.');
  process.exit(1);
} else if (results.warnings.length > 0) {
  console.log('\n⚠️  Some non-critical checks failed. Consider fixing.');
  process.exit(0);
} else {
  console.log('\n✅ All checks passed!');
  process.exit(0);
}

