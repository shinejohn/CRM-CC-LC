/**
 * Screenshot all 60 Manifest Destiny campaign landing pages.
 * Usage: node scripts/screenshot-landing-pages.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const OUTPUT_DIR = path.join(ROOT, 'screenshots', 'landing-pages');
const BASE_URL = 'http://localhost:5173';

// Build slug list from campaign JSONs (same logic as src/data/campaigns/index.ts)
function getSlugs() {
  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.startsWith('campaign_') && f.endsWith('_complete.json'))
    .sort();

  return files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8'));
    const campaign = data.campaign || {};
    const lp = data.landing_page;
    const cid = campaign.id || f.replace('.json', '').replace('_complete', '');

    let slug;
    if (lp && lp.landing_page_slug) {
      slug = lp.landing_page_slug;
    } else if (campaign.landing_page) {
      slug = campaign.landing_page;
    } else {
      slug = f.replace('.json', '').replace('_complete', '');
    }

    return { cid, slug, hasLandingPage: !!lp, title: campaign.title || 'Untitled' };
  });
}

async function run() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const slugs = getSlugs();
  console.log(`Found ${slugs.length} campaigns to screenshot\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const results = [];

  for (const { cid, slug, hasLandingPage, title } of slugs) {
    const url = `${BASE_URL}/learn/${slug}`;
    const filename = `${cid}_${slug}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    process.stdout.write(`${cid.padEnd(12)} /learn/${slug.padEnd(40)} `);

    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      // Wait for any animations to settle
      await page.waitForTimeout(1500);

      // Check for error states
      const notFound = await page.locator('text=Campaign not found').count();
      const invalidCampaign = await page.locator('text=Invalid campaign').count();

      let status;
      if (notFound > 0 || invalidCampaign > 0) {
        status = 'NOT_FOUND';
      } else {
        status = 'OK';
      }

      await page.screenshot({ path: filepath, fullPage: false });
      console.log(status);
      results.push({ cid, slug, filename, status, hasLandingPage, title });
    } catch (err) {
      console.log(`ERROR: ${err.message.slice(0, 80)}`);
      // Still try to capture whatever rendered
      try {
        await page.screenshot({ path: filepath, fullPage: false });
      } catch { /* ignore */ }
      results.push({ cid, slug, filename, status: 'ERROR', hasLandingPage, title, error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Write summary
  const summary = {
    total: results.length,
    ok: results.filter(r => r.status === 'OK').length,
    not_found: results.filter(r => r.status === 'NOT_FOUND').length,
    errors: results.filter(r => r.status === 'ERROR').length,
    results,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, '_summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\n=== SUMMARY ===`);
  console.log(`OK:        ${summary.ok}`);
  console.log(`NOT_FOUND: ${summary.not_found}`);
  console.log(`ERROR:     ${summary.errors}`);
  console.log(`\nScreenshots saved to: ${OUTPUT_DIR}`);
  console.log(`Summary: ${path.join(OUTPUT_DIR, '_summary.json')}`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
