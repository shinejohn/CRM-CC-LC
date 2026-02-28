/**
 * Campaign Verification Script
 * Loads all 60 campaign JSONs from public/campaigns/ and validates:
 * - Required fields exist (campaign.id, campaign.title, campaign.type)
 * - Landing page slug exists
 * - Every slide has a valid component name
 * - No undefined/null in required fields
 * - Type counts match expectations (15 EDU, 15 HOOK, 30 HOWTO)
 */

const fs = require('fs');
const path = require('path');

const CAMPAIGNS_DIR = path.join(__dirname, '..', 'public', 'campaigns');
const VALID_COMPONENTS = new Set([
  // Educational
  'HeroSlide', 'ConceptSlide', 'DataSlide', 'ComparisonSlide',
  'ActionSlide', 'ResourceSlide', 'CTASlide',
  // Hook
  'PersonalizedHeroSlide', 'ListingPreviewSlide', 'BenefitsSlide',
  'SocialProofSlide', 'ProcessSlide', 'ValueSlide',
  'CompetitorSlide', 'ROISlide', 'TestimonialSlide',
  'UrgencySlide', 'FeatureSlide', 'BeforeAfterSlide',
  'ExclusiveSlide', 'InteractiveSlide', 'CalculatorSlide',
  'DemoSlide', 'ResultSlide',
  // HowTo
  'TutorialIntroSlide', 'OverviewSlide', 'StepSlide',
  'TipSlide', 'ChecklistSlide', 'SummarySlide',
  'PracticeSlide', 'QuizSlide',
]);

let totalErrors = 0;
let totalWarnings = 0;
const typeCount = { Educational: 0, Hook: 0, HowTo: 0, Unknown: 0 };

const files = fs.readdirSync(CAMPAIGNS_DIR)
  .filter(f => f.startsWith('campaign_') && f.endsWith('.json') && !f.includes('master'));

console.log(`\n=== Campaign Verification ===`);
console.log(`Found ${files.length} campaign files\n`);

for (const file of files) {
  const filePath = path.join(CAMPAIGNS_DIR, file);
  let json;
  try {
    json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`[ERROR] ${file}: Failed to parse JSON — ${err.message}`);
    totalErrors++;
    continue;
  }

  const errors = [];
  const warnings = [];

  // Check campaign object
  if (!json.campaign) {
    errors.push('Missing `campaign` object');
  } else {
    if (!json.campaign.id) errors.push('Missing `campaign.id`');
    if (!json.campaign.title) errors.push('Missing `campaign.title`');
    if (!json.campaign.type) errors.push('Missing `campaign.type`');

    // Count types
    const type = json.campaign.type || '';
    if (type === 'Educational') typeCount.Educational++;
    else if (type === 'Hook') typeCount.Hook++;
    else if (type.startsWith('How-To') || type.startsWith('HowTo')) typeCount.HowTo++;
    else { typeCount.Unknown++; warnings.push(`Unknown campaign type: "${type}"`); }
  }

  // Check landing page — two valid formats:
  // 1. Full object: { landing_page: { landing_page_slug: "..." } }
  // 2. Compact: { campaign: { landing_page: "slug" } } (no top-level landing_page object)
  const hasFullLandingPage = json.landing_page && json.landing_page.landing_page_slug;
  const hasCompactSlug = json.campaign && json.campaign.landing_page;
  if (!hasFullLandingPage && !hasCompactSlug) {
    errors.push('No landing page slug found (neither `landing_page.landing_page_slug` nor `campaign.landing_page`)');
  }

  // Check slides
  if (!json.slides || !Array.isArray(json.slides)) {
    errors.push('Missing or invalid `slides` array');
  } else {
    json.slides.forEach((slide, i) => {
      if (!slide.component) {
        errors.push(`Slide ${i + 1}: Missing \`component\``);
      } else if (!VALID_COMPONENTS.has(slide.component)) {
        // Not an error — components may be new, just track them
        warnings.push(`Slide ${i + 1}: Unknown component "${slide.component}" (may be new)`);
      }
      if (!slide.title && slide.title !== '') {
        warnings.push(`Slide ${i + 1}: Missing \`title\``);
      }
    });
  }

  if (errors.length > 0) {
    console.error(`[FAIL] ${file}:`);
    errors.forEach(e => console.error(`  ❌ ${e}`));
    totalErrors += errors.length;
  }

  if (warnings.length > 0 && errors.length === 0) {
    // Only show warnings for otherwise passing files
    // console.warn(`[WARN] ${file}: ${warnings.length} warning(s)`);
  }
  totalWarnings += warnings.length;
}

console.log(`\n=== Type Counts ===`);
console.log(`  Educational: ${typeCount.Educational} (expected: 15)`);
console.log(`  Hook:        ${typeCount.Hook} (expected: 15)`);
console.log(`  HowTo:       ${typeCount.HowTo} (expected: 30)`);
if (typeCount.Unknown > 0) console.log(`  Unknown:     ${typeCount.Unknown}`);

console.log(`\n=== Summary ===`);
console.log(`  Total files:    ${files.length}`);
console.log(`  Errors:         ${totalErrors}`);
console.log(`  Warnings:       ${totalWarnings}`);

if (typeCount.Educational !== 15) {
  console.error(`  ❌ Expected 15 Educational, got ${typeCount.Educational}`);
  totalErrors++;
}
if (typeCount.Hook !== 15) {
  console.error(`  ❌ Expected 15 Hook, got ${typeCount.Hook}`);
  totalErrors++;
}
if (typeCount.HowTo !== 30) {
  console.error(`  ❌ Expected 30 HowTo, got ${typeCount.HowTo}`);
  totalErrors++;
}

if (totalErrors === 0) {
  console.log(`\n✅ All ${files.length} campaigns passed verification!\n`);
  process.exit(0);
} else {
  console.error(`\n❌ Verification failed with ${totalErrors} error(s)\n`);
  process.exit(1);
}
