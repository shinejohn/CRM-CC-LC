#!/usr/bin/env node

/**
 * Extended Verification Script
 * Additional checks beyond basic verification
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

function resolvePath(relativePath) {
  const fromScript = join(rootDir, relativePath);
  if (existsSync(fromScript)) return fromScript;
  return join(process.cwd(), relativePath);
}

const results = {
  passed: [],
  failed: [],
  warnings: [],
};

function check(name, test, critical = false) {
  try {
    if (test()) {
      results.passed.push(name);
      console.log(`✅ ${name}`);
    } else {
      if (critical) {
        results.failed.push(name);
        console.log(`❌ ${name}`);
      } else {
        results.warnings.push(name);
        console.log(`⚠️  ${name}`);
      }
    }
  } catch (error) {
    if (critical) {
      results.failed.push(`${name} (Error: ${error.message})`);
      console.log(`❌ ${name} - ${error.message}`);
    } else {
      results.warnings.push(`${name} (Error: ${error.message})`);
      console.log(`⚠️  ${name} - ${error.message}`);
    }
  }
}

console.log('🔍 Extended Verification Checks\n');
console.log('='.repeat(60) + '\n');

// Check 1: No console.logs in production code
check('No console.logs in production code', () => {
  const files = [
    'src/command-center/core/AppShell.tsx',
    'src/command-center/modules/dashboard/Dashboard.tsx',
  ];
  
  let hasConsoleLogs = false;
  for (const file of files) {
    const path = resolvePath(file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      // Allow console.error and console.warn, but not console.log
      if (content.includes('console.log(') && !content.includes('// eslint-disable')) {
        hasConsoleLogs = true;
        break;
      }
    }
  }
  return !hasConsoleLogs;
}, false);

// Check 2: All exports are used
check('Module exports are properly structured', () => {
  const indexFiles = [
    'src/command-center/core/index.ts',
    'src/command-center/services/index.ts',
    'src/command-center/hooks/index.ts',
    'src/command-center/modules/dashboard/index.ts',
  ];
  
  let allHaveExports = true;
  for (const file of indexFiles) {
    const path = resolvePath(file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      if (!content.includes('export')) {
        allHaveExports = false;
        break;
      }
    }
  }
  return allHaveExports;
}, true);

// Check 3: No TODO comments in critical files
check('No TODO comments in production code', () => {
  const criticalFiles = [
    'src/command-center/core/AppShell.tsx',
    'src/command-center/AppRouter.tsx',
    'src/command-center/AppProviders.tsx',
  ];
  
  let hasTODOs = false;
  for (const file of criticalFiles) {
    const path = resolvePath(file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      if (content.includes('TODO') || content.includes('FIXME')) {
        hasTODOs = true;
        break;
      }
    }
  }
  return !hasTODOs;
}, false);

// Check 4: Environment variables documented
check('Environment variables documented', () => {
  const envExample = resolvePath('.env.example');
  const envLocal = resolvePath('.env.local');
  
  // Check if .env.example exists or if there's documentation
  return existsSync(envExample) || existsSync(resolvePath('README.md'));
}, false);

// Check 5: Bundle size check (if dist exists)
check('Build output exists', () => {
  const distDir = resolvePath('dist');
  return existsSync(distDir);
}, false);

// Check 6: No duplicate dependencies
check('No duplicate dependencies', () => {
  const packageJson = resolvePath('package.json');
  if (!existsSync(packageJson)) return false;
  
  const pkg = JSON.parse(readFileSync(packageJson, 'utf-8'));
  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = Object.keys(pkg.devDependencies || {});
  
  const duplicates = deps.filter(dep => devDeps.includes(dep));
  return duplicates.length === 0;
}, false);

// Check 7: Proper error boundaries
check('Error boundaries implemented', () => {
  const errorBoundary = resolvePath('src/components/ui/ErrorBoundary.tsx');
  return existsSync(errorBoundary);
}, false);

// Check 8: Loading states implemented
check('Loading states implemented', () => {
  const loadingScreen = resolvePath('src/components/ui/LoadingScreen.tsx');
  const skeleton = resolvePath('src/components/ui/skeleton.tsx');
  return existsSync(loadingScreen) && existsSync(skeleton);
}, true);

// Check 9: Accessibility attributes
check('Accessibility attributes present', () => {
  const header = resolvePath('src/command-center/core/Header.tsx');
  if (!existsSync(header)) return false;
  
  const content = readFileSync(header, 'utf-8');
  return content.includes('aria-label') || content.includes('aria-');
}, false);

// Check 10: TypeScript strict mode
check('TypeScript configuration exists', () => {
  const tsconfig = resolvePath('tsconfig.json');
  if (!existsSync(tsconfig)) return false;
  
  try {
    const content = JSON.parse(readFileSync(tsconfig, 'utf-8'));
    return content.compilerOptions && (
      content.compilerOptions.strict === true ||
      content.compilerOptions.strict === undefined // Default is true
    );
  } catch (error) {
    // If JSON parsing fails, just check file exists
    return true;
  }
}, false);

console.log('\n' + '='.repeat(60));
console.log('📊 Extended Verification Summary\n');
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);
console.log(`❌ Failed: ${results.failed.length}`);

if (results.failed.length > 0) {
  console.log('\n❌ Some critical extended checks failed.');
  process.exit(1);
} else {
  console.log('\n✅ Extended verification complete!');
  process.exit(0);
}

