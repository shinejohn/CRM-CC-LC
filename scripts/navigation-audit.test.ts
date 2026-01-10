// ============================================
// NAVIGATION AUDIT SCRIPT
// Automatically tests all routes and navigation
// ============================================

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SERVER_ENDPOINT = 'http://127.0.0.1:7242/ingest/e5cb2706-be56-4bc4-8f83-3baa066ca0c9';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

interface NavigationLog {
  sessionId: string;
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data: {
    type: 'route' | 'link' | 'button' | 'modal' | 'api' | 'error';
    target: string;
    source: string;
    routeExists?: boolean;
    componentExists?: boolean;
    error?: string;
    statusCode?: number;
  };
  timestamp: number;
}

const logNavigation = async (log: Omit<NavigationLog, 'timestamp' | 'sessionId' | 'runId'>) => {
  const payload: NavigationLog = {
    ...log,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: log.runId || 'run1',
  };

  try {
    await fetch(SERVER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // Ignore logging errors
  }
};

// Extract all routes from AppRouter
const routes = [
  // Main routes
  '/',
  '/presentation',
  '/report',
  '/marketing-report',
  '/business-profile',
  '/data-analytics',
  '/client-proposal',
  '/ai-workflow',
  '/files',
  '/login',
  '/signup',
  '/profile',
  '/schedule',
  
  // Marketing routes
  '/community-influencer',
  '/community-expert',
  '/sponsors',
  '/ads',
  
  // Action routes
  '/article',
  '/events',
  '/classifieds',
  '/announcements',
  '/coupons',
  '/incentives',
  '/tickets',
  '/ai',
  
  // Business routes
  '/survey',
  '/subscriptions',
  '/todos',
  '/dashboard',
  
  // User routes
  '/sponsor',
  
  // CRM routes
  '/crm',
  '/crm/dashboard',
  '/crm/customers',
  '/crm/analytics/interest',
  '/crm/analytics/purchases',
  '/crm/analytics/learning',
  '/crm/campaigns',
  
  // Outbound routes
  '/outbound',
  '/outbound/email/create',
  '/outbound/phone/create',
  '/outbound/sms/create',
  
  // Command Center
  '/command-center',
  
  // AI Personalities
  '/ai-personalities',
  '/ai-personalities/assign',
  '/ai-personalities/contacts',
  
  // Learning Center routes
  '/learning',
  '/learning/faqs',
  '/learning/business-profile',
  '/learning/articles',
  '/learning/search',
  '/learning/training',
  
  // Getting Started routes
  '/learn/getting-started',
  '/learn/overview',
  '/learn/quickstart',
  '/learn/tutorial',
  '/learn/first-steps',
  '/learn/account-setup',
  '/learn/setup',
  '/learn/onboarding',
  '/learn/guides',
  '/learn/tips',
  '/learn/features',
  
  // Video Tutorials
  '/learn/video-basics',
  '/learn/presentation-tips',
  '/learn/ai-features',
  '/learn/advanced-workflows',
  '/learn/workflows',
  
  // Documentation
  '/learn/user-manual',
  '/learn/manual',
  '/learn/api-docs',
  '/learn/api',
  '/learn/best-practices',
  '/learn/troubleshooting',
  
  // Webinars & Events
  '/learn/webinars',
  '/learn/past-recordings',
  '/learn/recordings',
  '/learn/live-training',
  '/learn/community-events',
  '/learn/events',
  
  // Community
  '/learn/forums',
  '/learn/user-stories',
  '/learn/stories',
  '/learn/expert-network',
  '/learn/experts',
  '/learn/guidelines',
  
  // Certifications
  '/learn/certifications',
  '/learn/assessments',
  '/learn/paths',
  '/learn/badges',
  
  // Advanced Topics
  '/learn/ai-integration',
  '/learn/analytics',
  '/learn/custom-workflows',
  '/learn/enterprise',
  
  // Resources
  '/learn/templates',
  '/learn/case-studies',
  '/learn/reports',
  '/learn/blog',
  
  // Campaign routes
  '/learning/campaigns',
  '/learning/campaigns/review',
  '/campaigns',
  '/campaigns/review',
  
  // Service Catalog
  '/learning/services',
  
  // Campaign landing pages (sample)
  '/learn/claim-your-listing',
  '/learn/seo-reality-check',
  '/learn/command-center-basics',
];

test.describe('Navigation Audit', () => {
  test('Test all routes and navigation', async ({ page }) => {
    const visitedRoutes = new Set<string>();
    const brokenLinks: Array<{ from: string; to: string; error: string }> = [];
    
    // Test each route
    for (const route of routes) {
      try {
        await logNavigation({
          runId: 'playwright-run',
          hypothesisId: 'A',
          location: 'navigation-audit.ts:route-test',
          message: `Testing route: ${route}`,
          data: {
            type: 'route',
            target: route,
            source: 'navigation-audit',
          },
        });

        const response = await page.goto(`${BASE_URL}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });

        const statusCode = response?.status() || 0;
        const currentUrl = page.url();
        
        await logNavigation({
          runId: 'playwright-run',
          hypothesisId: 'A',
          location: 'navigation-audit.ts:route-result',
          message: `Route ${route} loaded`,
          data: {
            type: 'route',
            target: route,
            source: 'navigation-audit',
            routeExists: statusCode < 400,
            statusCode,
          },
        });

        visitedRoutes.add(route);

        // Wait for page to be interactive (with timeout)
        try {
          await page.waitForLoadState('domcontentloaded', { timeout: 5000 });
        } catch (e) {
          // Continue even if load state times out
        }

        // Find all links on the page
        const links = await page.locator('a[href]').all();
        for (const link of links) {
          try {
            const href = await link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
              continue;
            }

            const targetPath = href.startsWith('/') ? href : new URL(href, BASE_URL).pathname;
            
            await logNavigation({
              runId: 'playwright-run',
              hypothesisId: 'B',
              location: 'navigation-audit.ts:link-found',
              message: `Found link: ${targetPath}`,
              data: {
                type: 'link',
                target: targetPath,
                source: route,
              },
            });

            // Try clicking the link (in a new context to avoid navigation)
            try {
              await link.click({ timeout: 2000 });
              await page.waitForTimeout(500);
              
              const newUrl = page.url();
              await logNavigation({
                runId: 'playwright-run',
                hypothesisId: 'B',
                location: 'navigation-audit.ts:link-clicked',
                message: `Link clicked: ${targetPath}`,
                data: {
                  type: 'link',
                  target: targetPath,
                  source: route,
                  routeExists: !newUrl.includes('404') && !newUrl.includes('error'),
                },
              });

              // Navigate back if we moved
              if (newUrl !== currentUrl && !targetPath.includes(':')) {
                await page.goBack({ waitUntil: 'networkidle' });
              }
            } catch (e) {
              await logNavigation({
                runId: 'playwright-run',
                hypothesisId: 'B',
                location: 'navigation-audit.ts:link-error',
                message: `Link click failed: ${targetPath}`,
                data: {
                  type: 'error',
                  target: targetPath,
                  source: route,
                  error: e instanceof Error ? e.message : String(e),
                },
              });
            }
          } catch (e) {
            // Ignore individual link errors
          }
        }

        // Find all buttons
        const buttons = await page.locator('button').all();
        for (const button of buttons) {
          try {
            const text = await button.textContent();
            const ariaLabel = await button.getAttribute('aria-label');
            const buttonId = await button.getAttribute('id');
            const buttonInfo = text || ariaLabel || buttonId || 'unknown';

            await logNavigation({
              runId: 'playwright-run',
              hypothesisId: 'C',
              location: 'navigation-audit.ts:button-found',
              message: `Found button: ${buttonInfo}`,
              data: {
                type: 'button',
                target: buttonInfo,
                source: route,
              },
            });

            // Check if button is disabled
            const isDisabled = await button.isDisabled();
            if (isDisabled) {
              continue;
            }

            // Try clicking button (but don't navigate away)
            try {
              await button.click({ timeout: 2000 });
              await page.waitForTimeout(500);
              
              await logNavigation({
                runId: 'playwright-run',
                hypothesisId: 'C',
                location: 'navigation-audit.ts:button-clicked',
                message: `Button clicked: ${buttonInfo}`,
                data: {
                  type: 'button',
                  target: buttonInfo,
                  source: route,
                },
              });
            } catch (e) {
              await logNavigation({
                runId: 'playwright-run',
                hypothesisId: 'C',
                location: 'navigation-audit.ts:button-error',
                message: `Button click failed: ${buttonInfo}`,
                data: {
                  type: 'error',
                  target: buttonInfo,
                  source: route,
                  error: e instanceof Error ? e.message : String(e),
                },
              });
            }
          } catch (e) {
            // Ignore individual button errors
          }
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        await logNavigation({
          runId: 'playwright-run',
          hypothesisId: 'A',
          location: 'navigation-audit.ts:route-error',
          message: `Route failed: ${route}`,
          data: {
            type: 'error',
            target: route,
            source: 'navigation-audit',
            error: errorMessage,
            routeExists: false,
          },
        });

        brokenLinks.push({
          from: 'navigation-audit',
          to: route,
          error: errorMessage,
        });

        // If browser/page was closed, recreate it
        if (errorMessage.includes('Target page, context or browser has been closed')) {
          try {
            await page.close();
          } catch (e) {
            // Ignore
          }
          // Page will be recreated by Playwright on next iteration
          continue;
        }
        
        // For timeout errors, try to continue with a fresh navigation
        if (errorMessage.includes('timeout')) {
          try {
            // Try to navigate away from the stuck page
            await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 5000 });
          } catch (e) {
            // If that fails, continue anyway
          }
        }
      }
    }

    // Summary
    await logNavigation({
      runId: 'playwright-run',
      hypothesisId: 'SUMMARY',
      location: 'navigation-audit.ts:summary',
      message: `Navigation audit complete: ${visitedRoutes.size}/${routes.length} routes tested`,
      data: {
        type: 'route',
        target: 'summary',
        source: 'navigation-audit',
        routeExists: true,
      },
    });

    console.log(`\n✅ Navigation Audit Complete!`);
    console.log(`   Routes tested: ${visitedRoutes.size}/${routes.length}`);
    console.log(`   Broken links: ${brokenLinks.length}`);
    if (brokenLinks.length > 0) {
      console.log(`\n❌ Broken Links:`);
      brokenLinks.forEach(link => {
        console.log(`   ${link.from} → ${link.to}: ${link.error}`);
      });
    }
  });
});

