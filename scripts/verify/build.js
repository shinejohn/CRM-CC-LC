#!/usr/bin/env node

/**
 * Verify Build
 * Checks that the project can build successfully
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

function verifyBuild() {
  console.log('🔍 Verifying build process...\n');
  
  const viteConfig = join(rootDir, 'vite.config.ts');
  const packageJson = join(rootDir, 'package.json');
  
  if (!existsSync(packageJson)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }
  
  // Check if build script exists
  try {
    const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
    if (!pkg.scripts || !pkg.scripts.build) {
      console.error('❌ Build script not found in package.json');
      process.exit(1);
    }
    
    console.log('✅ Build script found');
    console.log('Running build...\n');
    
    execSync('npm run build', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    
    console.log('\n✅ Build verification passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Build verification failed');
    process.exit(1);
  }
}

verifyBuild();

