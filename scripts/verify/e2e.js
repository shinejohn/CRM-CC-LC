#!/usr/bin/env node

/**
 * Verify E2E Tests
 * Checks that E2E test setup exists
 */

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

function verifyE2E() {
  console.log('🔍 Verifying E2E test setup...\n');
  
  const errors = [];
  
  // Check for Playwright config
  const playwrightConfig = join(rootDir, 'playwright.config.ts');
  const playwrightConfigJs = join(rootDir, 'playwright.config.js');
  
  if (existsSync(playwrightConfig) || existsSync(playwrightConfigJs)) {
    console.log('✅ Playwright config exists');
  } else {
    errors.push('⚠️  Playwright config not found (optional)');
  }
  
  // Check for e2e directory
  const e2eDir = join(rootDir, 'e2e');
  if (existsSync(e2eDir)) {
    const files = readdirSync(e2eDir);
    if (files.length > 0) {
      console.log(`✅ E2E test directory exists with ${files.length} file(s)`);
    } else {
      errors.push('⚠️  E2E directory exists but is empty');
    }
  } else {
    errors.push('⚠️  E2E test directory not found (optional)');
  }
  
  // Check package.json for playwright
  const packageJson = join(rootDir, 'package.json');
  try {
    const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
    const hasPlaywright = pkg.devDependencies && pkg.devDependencies['@playwright/test'];
    if (hasPlaywright) {
      console.log('✅ Playwright dependency installed');
    } else {
      errors.push('⚠️  Playwright not installed (optional)');
    }
  } catch (error) {
    errors.push('❌ Could not read package.json');
  }
  
  console.log('\n');
  
  // E2E is optional, so warnings don't fail
  const criticalErrors = errors.filter(e => e.startsWith('❌'));
  
  if (criticalErrors.length > 0) {
    console.error('❌ E2E verification failed:\n');
    criticalErrors.forEach(err => console.error(err));
    process.exit(1);
  }
  
  if (errors.length > 0) {
    console.log('⚠️  E2E setup warnings:\n');
    errors.forEach(err => console.log(err));
  }
  
  console.log('✅ E2E verification passed!');
  process.exit(0);
}

verifyE2E();

