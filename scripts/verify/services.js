#!/usr/bin/env node

/**
 * Verify Services
 * Checks that services are properly structured and exported
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const servicesDir = join(rootDir, 'src/command-center/services');

const requiredServices = [
  'api.service.ts',
  'websocket.service.ts',
  'events.service.ts',
];

function checkService(fileName) {
  const filePath = join(servicesDir, fileName);
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for class or function export
    if (!content.includes('export')) {
      return { fileName, error: 'Missing export statement' };
    }
    
    // Check for singleton export (common pattern)
    const hasExport = content.includes('export const') || content.includes('export class') || content.includes('export function');
    if (!hasExport) {
      return { fileName, error: 'Missing proper export' };
    }
    
    return { fileName, valid: true };
  } catch (error) {
    return { fileName, error: error.message };
  }
}

function verifyServices() {
  console.log('🔍 Verifying services...\n');
  
  const results = [];
  const errors = [];
  
  for (const service of requiredServices) {
    const result = checkService(service);
    results.push(result);
    
    if (result.error) {
      errors.push(`❌ ${service}: ${result.error}`);
    } else {
      console.log(`✅ ${service}`);
    }
  }
  
  // Check services index
  const indexPath = join(servicesDir, 'index.ts');
  try {
    const indexContent = readFileSync(indexPath, 'utf-8');
    if (indexContent.includes('export')) {
      console.log('✅ services/index.ts');
    } else {
      errors.push('❌ services/index.ts: Missing exports');
    }
  } catch (error) {
    errors.push(`❌ services/index.ts: ${error.message}`);
  }
  
  console.log('\n');
  
  if (errors.length > 0) {
    console.error('❌ Service verification failed:\n');
    errors.forEach(err => console.error(err));
    process.exit(1);
  }
  
  console.log('✅ Service verification passed!');
  process.exit(0);
}

verifyServices();

