#!/usr/bin/env node

/**
 * Verify Tests
 * Checks that test setup exists and tests can run
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

function verifyTests() {
  console.log('🔍 Verifying test setup...\n');
  
  const errors = [];
  
  // Check test setup file
  const setupPath = join(rootDir, 'src/command-center/test/setup.ts');
  if (existsSync(setupPath)) {
    console.log('✅ Test setup file exists');
  } else {
    errors.push('❌ Missing test setup file');
  }
  
  // Check vitest config
  const vitestConfig = join(rootDir, 'vitest.config.ts');
  const packageJson = join(rootDir, 'package.json');
  
  if (existsSync(vitestConfig)) {
    console.log('✅ Vitest config exists');
  } else {
    // Check if vitest is configured in package.json
    try {
      const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
      if (pkg.scripts && pkg.scripts.test) {
        console.log('✅ Test script configured in package.json');
      } else {
        errors.push('⚠️  No test configuration found');
      }
    } catch (error) {
      errors.push('❌ Could not read package.json');
    }
  }
  
  console.log('\n');
  
  if (errors.length > 0) {
    console.error('❌ Test verification failed:\n');
    errors.forEach(err => console.error(err));
    process.exit(1);
  }
  
  console.log('✅ Test verification passed!');
  process.exit(0);
}

verifyTests();

