#!/usr/bin/env node

/**
 * Verify React Components
 * Checks that components can be imported and have proper exports
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const componentsDir = join(rootDir, 'src/command-center');

const requiredComponents = [
  'core/AppShell.tsx',
  'core/Header.tsx',
  'core/Sidebar.tsx',
  'core/RightPanel.tsx',
  'modules/dashboard/Dashboard.tsx',
  'modules/dashboard/MetricsRow.tsx',
  'modules/dashboard/DashboardGrid.tsx',
  'modules/dashboard/QuickActionDock.tsx',
];

function checkComponent(path) {
  const fullPath = join(componentsDir, path);
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    
    // Check for React import
    if (!content.includes('import') && !content.includes('from \'react\'')) {
      return { path, error: 'Missing React import' };
    }
    
    // Check for export
    if (!content.includes('export')) {
      return { path, error: 'Missing export statement' };
    }
    
    // Check for default export or named export
    const hasDefaultExport = content.includes('export default') || content.includes('export function') || content.includes('export const');
    if (!hasDefaultExport && !content.includes('export {')) {
      return { path, error: 'Missing export (default or named)' };
    }
    
    return { path, valid: true };
  } catch (error) {
    return { path, error: error.message };
  }
}

function verifyComponents() {
  console.log('🔍 Verifying React components...\n');
  
  const results = [];
  const errors = [];
  
  for (const component of requiredComponents) {
    const result = checkComponent(component);
    results.push(result);
    
    if (result.error) {
      errors.push(`❌ ${component}: ${result.error}`);
    } else {
      console.log(`✅ ${component}`);
    }
  }
  
  console.log('\n');
  
  if (errors.length > 0) {
    console.error('❌ Component verification failed:\n');
    errors.forEach(err => console.error(err));
    process.exit(1);
  }
  
  console.log('✅ Component verification passed!');
  process.exit(0);
}

verifyComponents();

