#!/usr/bin/env node

/**
 * Verify Routing Configuration
 * Checks that routes are properly configured
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

const requiredRoutes = [
  '/login',
  '/command-center',
  '/command-center/dashboard',
  '/command-center/activities',
  '/command-center/customers',
  '/command-center/customers/:id',
  '/command-center/content',
  '/command-center/campaigns',
  '/command-center/campaigns/:id',
  '/command-center/services',
  '/command-center/ai',
  '/command-center/settings',
];

function verifyRouting() {
  console.log('🔍 Verifying routing configuration...\n');
  
  const routerPath = join(rootDir, 'src/command-center/AppRouter.tsx');
  
  try {
    const content = readFileSync(routerPath, 'utf-8');
    
    // Check for Routes component
    if (!content.includes('Routes') || !content.includes('Route')) {
      console.error('❌ AppRouter.tsx: Missing Routes/Route components');
      process.exit(1);
    }
    
    // Check for required routes
    const errors = [];
    const foundRoutes = [];
    
    for (const route of requiredRoutes) {
      // Check for full path or relative path
      const routePattern = route.replace(/:id/g, ':id');
      const relativePath = route.replace('/command-center/', '').replace('/login', 'login');
      
      // Check various formats
      const hasRoute = content.includes(routePattern) || 
                      content.includes(route.replace('/', '')) ||
                      content.includes(`path="${relativePath}"`) ||
                      content.includes(`path='${relativePath}'`) ||
                      content.includes(`"${relativePath}"`) ||
                      content.includes(`'${relativePath}'`) ||
                      (relativePath.includes(':') && content.includes(relativePath.split(':')[0])) ||
                      (relativePath === 'dashboard' && content.includes('dashboard')) ||
                      (relativePath === 'activities' && content.includes('Activities')) ||
                      (relativePath === 'customers' && content.includes('Customers')) ||
                      (relativePath === 'content' && content.includes('Content')) ||
                      (relativePath === 'campaigns' && content.includes('Campaigns')) ||
                      (relativePath === 'services' && content.includes('Services')) ||
                      (relativePath === 'ai' && content.includes('AIHub')) ||
                      (relativePath === 'settings' && content.includes('Settings'));
      
      if (hasRoute) {
        foundRoutes.push(route);
        console.log(`✅ Route: ${route}`);
      } else {
        errors.push(`❌ Missing route: ${route}`);
      }
    }
    
    // Check for AuthGuard
    if (!content.includes('AuthGuard')) {
      errors.push('❌ Missing AuthGuard on protected routes');
    } else {
      console.log('✅ AuthGuard configured');
    }
    
    // Check for lazy loading
    if (!content.includes('lazy') || !content.includes('Suspense')) {
      errors.push('⚠️  Routes not using lazy loading');
    } else {
      console.log('✅ Lazy loading configured');
    }
    
    console.log('\n');
    
    if (errors.length > 0) {
      console.error('❌ Routing verification failed:\n');
      errors.forEach(err => console.error(err));
      process.exit(1);
    }
    
    console.log('✅ Routing verification passed!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error reading AppRouter.tsx: ${error.message}`);
    process.exit(1);
  }
}

verifyRouting();

