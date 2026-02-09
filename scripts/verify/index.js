#!/usr/bin/env node

/**
 * Full Verification Script
 * Runs all verification checks
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

const checks = [
  'structure',
  'types',
  'components',
  'services',
  'routing',
  'tests',
  'build',
  'e2e',
];

console.log('🚀 Running full verification...\n');
console.log('='.repeat(50) + '\n');

const results = [];

for (const check of checks) {
  console.log(`\n📋 Running ${check} check...\n`);
  console.log('-'.repeat(50));
  
  try {
    execSync(`node scripts/verify/${check}.js`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
    results.push({ check, passed: true });
  } catch (error) {
    results.push({ check, passed: false });
    console.error(`\n❌ ${check} check failed`);
  }
  
  console.log('\n');
}

console.log('='.repeat(50));
console.log('\n📊 Verification Summary:\n');

let allPassed = true;
for (const result of results) {
  const status = result.passed ? '✅' : '❌';
  console.log(`${status} ${result.check}`);
  if (!result.passed) {
    allPassed = false;
  }
}

console.log('\n');

if (allPassed) {
  console.log('✅ All verifications passed!');
  process.exit(0);
} else {
  console.log('❌ Some verifications failed');
  process.exit(1);
}

