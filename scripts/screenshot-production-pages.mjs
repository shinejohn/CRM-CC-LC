/**
 * Screenshot all 60 Manifest Destiny campaign landing pages on production.
 * Usage: node scripts/screenshot-production-pages.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'screenshots', 'production');

const PAGES = [
  { cid: 'HOOK-001', slug: 'claim-your-listing', url: 'https://Just1hug.com/learn/claim-your-listing?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-001&community=clearwater-fl' },
  { cid: 'HOOK-002', slug: 'post-your-event', url: 'https://Just1hug.com/learn/post-your-event?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-002&community=clearwater-fl' },
  { cid: 'HOOK-003', slug: 'create-coupon', url: 'https://Just1hug.com/learn/create-coupon?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-003&community=clearwater-fl' },
  { cid: 'HOOK-004', slug: 'get-featured', url: 'https://Just1hug.com/learn/get-featured?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-004&community=clearwater-fl' },
  { cid: 'HOOK-005', slug: 'post-classified', url: 'https://Just1hug.com/learn/post-classified?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-005&community=clearwater-fl' },
  { cid: 'HOOK-006', slug: 'crm-integration', url: 'https://Just1hug.com/learn/crm-integration?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-006&community=clearwater-fl' },
  { cid: 'HOOK-007', slug: 'featured-listing', url: 'https://Just1hug.com/learn/featured-listing?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-007&community=clearwater-fl' },
  { cid: 'HOOK-008', slug: 'newsletter-advertising', url: 'https://Just1hug.com/learn/newsletter-advertising?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-008&community=clearwater-fl' },
  { cid: 'HOOK-009', slug: 'become-sponsor', url: 'https://Just1hug.com/learn/become-sponsor?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-009&community=clearwater-fl' },
  { cid: 'HOOK-010', slug: 'article-advertising', url: 'https://Just1hug.com/learn/article-advertising?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-010&community=clearwater-fl' },
  { cid: 'HOOK-011', slug: 'expert-registration', url: 'https://Just1hug.com/learn/expert-registration?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-011&community=clearwater-fl' },
  { cid: 'HOOK-012', slug: 'influencer-program', url: 'https://Just1hug.com/learn/influencer-program?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-012&community=clearwater-fl' },
  { cid: 'HOOK-013', slug: 'social-posting-trial', url: 'https://Just1hug.com/learn/social-posting-trial?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-013&community=clearwater-fl' },
  { cid: 'HOOK-014', slug: 'holiday-events', url: 'https://Just1hug.com/learn/holiday-events?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-014&community=clearwater-fl' },
  { cid: 'HOOK-015', slug: 'business-nomination', url: 'https://Just1hug.com/learn/business-nomination?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-hook&utm_content=HOOK-015&community=clearwater-fl' },
  { cid: 'EDU-001', slug: 'seo-reality-check', url: 'https://Just1hug.com/learn/seo-reality-check?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-001&community=clearwater-fl' },
  { cid: 'EDU-002', slug: 'ai-marketing-101', url: 'https://Just1hug.com/learn/ai-marketing-101?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-002&community=clearwater-fl' },
  { cid: 'EDU-003', slug: 'ai-marketing-assistant', url: 'https://Just1hug.com/learn/ai-marketing-assistant?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-003&community=clearwater-fl' },
  { cid: 'EDU-004', slug: 'ai-operations-guide', url: 'https://Just1hug.com/learn/ai-operations-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-004&community=clearwater-fl' },
  { cid: 'EDU-005', slug: 'ai-search-visibility', url: 'https://Just1hug.com/learn/ai-search-visibility?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-005&community=clearwater-fl' },
  { cid: 'EDU-006', slug: 'community-marketing', url: 'https://Just1hug.com/learn/community-marketing?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-006&community=clearwater-fl' },
  { cid: 'EDU-007', slug: 'reputation-ai-age', url: 'https://Just1hug.com/learn/reputation-ai-age?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-007&community=clearwater-fl' },
  { cid: 'EDU-008', slug: 'ai-customer-service', url: 'https://Just1hug.com/learn/ai-customer-service?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-008&community=clearwater-fl' },
  { cid: 'EDU-009', slug: 'voice-ai-guide', url: 'https://Just1hug.com/learn/voice-ai-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-009&community=clearwater-fl' },
  { cid: 'EDU-010', slug: 'local-seo-guide', url: 'https://Just1hug.com/learn/local-seo-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-010&community=clearwater-fl' },
  { cid: 'EDU-011', slug: 'ai-content-guide', url: 'https://Just1hug.com/learn/ai-content-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-011&community=clearwater-fl' },
  { cid: 'EDU-012', slug: 'future-proof-guide', url: 'https://Just1hug.com/learn/future-proof-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-012&community=clearwater-fl' },
  { cid: 'EDU-013', slug: 'data-privacy-guide', url: 'https://Just1hug.com/learn/data-privacy-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-013&community=clearwater-fl' },
  { cid: 'EDU-014', slug: 'competitive-intelligence', url: 'https://Just1hug.com/learn/competitive-intelligence?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-014&community=clearwater-fl' },
  { cid: 'EDU-015', slug: 'ai-employees-explained', url: 'https://Just1hug.com/learn/ai-employees-explained?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-educational&utm_content=EDU-015&community=clearwater-fl' },
  { cid: 'HOWTO-001', slug: 'command-center-basics', url: 'https://Just1hug.com/learn/command-center-basics?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-001&community=clearwater-fl' },
  { cid: 'HOWTO-002', slug: 'create-article', url: 'https://Just1hug.com/learn/create-article?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-002&community=clearwater-fl' },
  { cid: 'HOWTO-003', slug: 'event-creation-guide', url: 'https://Just1hug.com/learn/event-creation-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-003&community=clearwater-fl' },
  { cid: 'HOWTO-004', slug: 'premium-venue-setup', url: 'https://Just1hug.com/learn/premium-venue-setup?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-004&community=clearwater-fl' },
  { cid: 'HOWTO-005', slug: 'performer-registration', url: 'https://Just1hug.com/learn/performer-registration?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-005&community=clearwater-fl' },
  { cid: 'HOWTO-006', slug: 'post-announcement', url: 'https://Just1hug.com/learn/post-announcement?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-006&community=clearwater-fl' },
  { cid: 'HOWTO-007', slug: 'multi-community-guide', url: 'https://Just1hug.com/learn/multi-community-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-007&community=clearwater-fl' },
  { cid: 'HOWTO-008', slug: 'ai-sales-setup', url: 'https://Just1hug.com/learn/ai-sales-setup?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-008&community=clearwater-fl' },
  { cid: 'HOWTO-009', slug: 'dashboard-tour', url: 'https://Just1hug.com/learn/dashboard-tour?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-009&community=clearwater-fl' },
  { cid: 'HOWTO-010', slug: 'social-connection-guide', url: 'https://Just1hug.com/learn/social-connection-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-010&community=clearwater-fl' },
  { cid: 'HOWTO-011', slug: 'email-marketing-setup', url: 'https://Just1hug.com/learn/email-marketing-setup?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-011&community=clearwater-fl' },
  { cid: 'HOWTO-012', slug: 'review-response-guide', url: 'https://Just1hug.com/learn/review-response-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-012&community=clearwater-fl' },
  { cid: 'HOWTO-013', slug: 'automated-posting-guide', url: 'https://Just1hug.com/learn/automated-posting-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-013&community=clearwater-fl' },
  { cid: 'HOWTO-014', slug: 'customer-survey-setup', url: 'https://Just1hug.com/learn/customer-survey-setup?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-014&community=clearwater-fl' },
  { cid: 'HOWTO-015', slug: 'analytics-guide', url: 'https://Just1hug.com/learn/analytics-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-015&community=clearwater-fl' },
  { cid: 'HOWTO-016', slug: 'lead-capture-guide', url: 'https://Just1hug.com/learn/lead-capture-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-016&community=clearwater-fl' },
  { cid: 'HOWTO-017', slug: 'appointment-booking-setup', url: 'https://Just1hug.com/learn/appointment-booking-setup?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-017&community=clearwater-fl' },
  { cid: 'HOWTO-018', slug: 'invoice-automation-guide', url: 'https://Just1hug.com/learn/invoice-automation-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-018&community=clearwater-fl' },
  { cid: 'HOWTO-019', slug: 'sms-marketing-guide', url: 'https://Just1hug.com/learn/sms-marketing-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-019&community=clearwater-fl' },
  { cid: 'HOWTO-020', slug: 'faq-builder-guide', url: 'https://Just1hug.com/learn/faq-builder-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-020&community=clearwater-fl' },
  { cid: 'HOWTO-021', slug: 'google-integration-guide', url: 'https://Just1hug.com/learn/google-integration-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-021&community=clearwater-fl' },
  { cid: 'HOWTO-022', slug: 'workflow-automation-guide', url: 'https://Just1hug.com/learn/workflow-automation-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-022&community=clearwater-fl' },
  { cid: 'HOWTO-023', slug: 'report-generation-guide', url: 'https://Just1hug.com/learn/report-generation-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-023&community=clearwater-fl' },
  { cid: 'HOWTO-024', slug: 'customer-segmentation-guide', url: 'https://Just1hug.com/learn/customer-segmentation-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-024&community=clearwater-fl' },
  { cid: 'HOWTO-025', slug: 'ai-training-guide', url: 'https://Just1hug.com/learn/ai-training-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-025&community=clearwater-fl' },
  { cid: 'HOWTO-026', slug: 'integration-marketplace', url: 'https://Just1hug.com/learn/integration-marketplace?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-026&community=clearwater-fl' },
  { cid: 'HOWTO-027', slug: 'team-collaboration-guide', url: 'https://Just1hug.com/learn/team-collaboration-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-027&community=clearwater-fl' },
  { cid: 'HOWTO-028', slug: 'content-calendar-guide', url: 'https://Just1hug.com/learn/content-calendar-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-028&community=clearwater-fl' },
  { cid: 'HOWTO-029', slug: 'roi-tracking-guide', url: 'https://Just1hug.com/learn/roi-tracking-guide?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-029&community=clearwater-fl' },
  { cid: 'HOWTO-030', slug: 'success-playbook', url: 'https://Just1hug.com/learn/success-playbook?utm_source=email&utm_medium=outbound&utm_campaign=90day-week1-how-to&utm_content=HOWTO-030&community=clearwater-fl' },
];

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Screenshotting ${PAGES.length} production pages on Just1hug.com\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const results = [];

  for (const { cid, slug, url } of PAGES) {
    const filename = `${cid}_${slug}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    process.stdout.write(`${cid.padEnd(12)} /learn/${slug.padEnd(40)} `);

    const page = await context.newPage();
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      const httpStatus = response?.status() ?? 0;

      // Wait for content to settle
      await page.waitForTimeout(2000);

      // Detect various error/not-found states
      const bodyText = await page.locator('body').innerText();
      const notFound = bodyText.includes('Campaign not found') ||
                       bodyText.includes('Campaign Not Found') ||
                       bodyText.includes('Invalid campaign');
      const is404 = bodyText.includes('404') || bodyText.includes('Page not found') || bodyText.includes('Not Found');
      const hasPlaceholders = /\{\{\w+\}\}/.test(bodyText);

      let status;
      if (httpStatus >= 400) {
        status = `HTTP_${httpStatus}`;
      } else if (notFound) {
        status = 'NOT_FOUND';
      } else if (is404) {
        status = '404_PAGE';
      } else {
        status = hasPlaceholders ? 'OK_WITH_VARS' : 'OK';
      }

      await page.screenshot({ path: filepath, fullPage: false });
      console.log(`${status}${hasPlaceholders ? ' (has {{vars}})' : ''}`);
      results.push({ cid, slug, filename, status, httpStatus, hasPlaceholders });
    } catch (err) {
      console.log(`ERROR: ${err.message.slice(0, 80)}`);
      try {
        await page.screenshot({ path: filepath, fullPage: false });
      } catch { /* ignore */ }
      results.push({ cid, slug, filename, status: 'ERROR', error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Summary
  const summary = {
    total: results.length,
    ok: results.filter(r => r.status === 'OK').length,
    ok_with_vars: results.filter(r => r.status === 'OK_WITH_VARS').length,
    not_found: results.filter(r => r.status === 'NOT_FOUND').length,
    page_404: results.filter(r => r.status === '404_PAGE').length,
    http_error: results.filter(r => r.status?.startsWith('HTTP_')).length,
    errors: results.filter(r => r.status === 'ERROR').length,
    results,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, '_summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\n=== PRODUCTION SUMMARY ===`);
  console.log(`OK (clean):          ${summary.ok}`);
  console.log(`OK (with {{vars}}):  ${summary.ok_with_vars}`);
  console.log(`NOT_FOUND:           ${summary.not_found}`);
  console.log(`404 Page:            ${summary.page_404}`);
  console.log(`HTTP Error:          ${summary.http_error}`);
  console.log(`Error:               ${summary.errors}`);
  console.log(`\nScreenshots: ${OUTPUT_DIR}`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
