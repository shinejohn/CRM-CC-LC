#!/usr/bin/env node

/**
 * Verify Command Center Structure
 * Checks that all required directories and files exist
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const srcDir = join(rootDir, 'src/command-center');

const requiredStructure = {
  'src/command-center': {
    type: 'directory',
    required: true,
  },
  'src/command-center/core': {
    type: 'directory',
    required: true,
    children: [
      'AppShell.tsx',
      'Header.tsx',
      'Sidebar.tsx',
      'RightPanel.tsx',
      'LayoutContext.tsx',
      'AuthContext.tsx',
      'AuthGuard.tsx',
      'ThemeProvider.tsx',
    ],
  },
  'src/command-center/modules': {
    type: 'directory',
    required: true,
  },
  'src/command-center/modules/dashboard': {
    type: 'directory',
    required: true,
    children: ['Dashboard.tsx', 'MetricsRow.tsx', 'DashboardGrid.tsx', 'QuickActionDock.tsx'],
  },
  'src/command-center/services': {
    type: 'directory',
    required: true,
    children: ['api.service.ts', 'websocket.service.ts', 'events.service.ts'],
  },
  'src/command-center/hooks': {
    type: 'directory',
    required: true,
    children: ['useWebSocket.ts', 'useDashboard.ts', 'useCrossModule.ts'],
  },
  'src/command-center/config': {
    type: 'directory',
    required: true,
    children: ['navigation.ts', 'events.ts'],
  },
  'src/command-center/pages': {
    type: 'directory',
    required: true,
  },
  'src/command-center/components': {
    type: 'directory',
    required: true,
  },
  'src/components/ui': {
    type: 'directory',
    required: true,
    children: ['input.tsx', 'button.tsx', 'card.tsx', 'skeleton.tsx', 'tooltip.tsx', 'toaster.tsx'],
  },
  'src/command-center/AppRouter.tsx': {
    type: 'file',
    required: true,
  },
  'src/command-center/AppProviders.tsx': {
    type: 'file',
    required: true,
  },
  'src/command-center/CommandCenterApp.tsx': {
    type: 'file',
    required: true,
  },
};

function checkPath(path, config) {
  const fullPath = join(rootDir, path);
  const exists = existsSync(fullPath);
  
  if (!exists && config.required) {
    return { path, exists: false, error: 'Missing required path' };
  }
  
  if (!exists) {
    return { path, exists: false };
  }
  
  const stat = statSync(fullPath);
  const isDirectory = stat.isDirectory();
  const isFile = stat.isFile();
  
  if (config.type === 'directory' && !isDirectory) {
    return { path, exists: true, error: 'Expected directory but found file' };
  }
  
  if (config.type === 'file' && !isFile) {
    return { path, exists: true, error: 'Expected file but found directory' };
  }
  
  const issues = [];
  
  if (config.children && isDirectory) {
    const children = readdirSync(fullPath);
    for (const child of config.children) {
      if (!children.includes(child)) {
        issues.push(`Missing child: ${child}`);
      }
    }
  }
  
  return { path, exists: true, issues: issues.length > 0 ? issues : undefined };
}

function verifyStructure() {
  console.log('🔍 Verifying Command Center structure...\n');
  
  const results = [];
  const errors = [];
  
  for (const [path, config] of Object.entries(requiredStructure)) {
    const result = checkPath(path, config);
    results.push(result);
    
    if (!result.exists && config.required) {
      errors.push(`❌ Missing required: ${path}`);
    } else if (result.error) {
      errors.push(`❌ ${path}: ${result.error}`);
    } else if (result.issues) {
      result.issues.forEach(issue => {
        errors.push(`⚠️  ${path}: ${issue}`);
      });
    } else if (result.exists) {
      console.log(`✅ ${path}`);
    }
  }
  
  console.log('\n');
  
  if (errors.length > 0) {
    console.error('❌ Structure verification failed:\n');
    errors.forEach(err => console.error(err));
    process.exit(1);
  }
  
  console.log('✅ Structure verification passed!');
  process.exit(0);
}

verifyStructure();

