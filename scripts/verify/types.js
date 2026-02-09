#!/usr/bin/env node

/**
 * Verify TypeScript Types
 * Checks that TypeScript compilation succeeds
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

function verifyTypes() {
  console.log('🔍 Verifying TypeScript types...\n');
  
  const tsconfigPath = join(rootDir, 'tsconfig.json');
  
  if (!existsSync(tsconfigPath)) {
    console.error('❌ tsconfig.json not found');
    process.exit(1);
  }
  
  try {
    console.log('Running TypeScript compiler check...');
    execSync('npx tsc --noEmit', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('\n✅ Type checking passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Type checking failed');
    process.exit(1);
  }
}

verifyTypes();

