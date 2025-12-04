#!/usr/bin/env node
/**
 * Generate all campaign JSON files from the master landing pages file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const masterFile = path.join(__dirname, '../Data-Land-pages-campaign/landing_pages_master.json');
const outputDir = path.join(__dirname, '../public/campaigns');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load master data
const masterData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
const landingPages = masterData.landing_pages || [];

console.log(`Generating ${landingPages.length} campaign files...`);

let generated = 0;
let skipped = 0;

landingPages.forEach((landingPage) => {
  const campaignId = landingPage.campaign_id;
  const outputFile = path.join(outputDir, `campaign_${campaignId}.json`);

  // Skip if file already exists
  if (fs.existsSync(outputFile)) {
    skipped++;
    return;
  }

  // Determine campaign type and create base structure
  const campaignType = campaignId.split('-')[0]; // HOOK, EDU, HOWTO
  
  // Create campaign data structure
  const campaignData = {
    campaign: {
      id: campaignId,
      week: parseInt(campaignId.split('-')[1]) || 1,
      day: parseInt(campaignId.split('-')[1]) || 1,
      type: campaignType,
      title: landingPage.template_name || `${campaignType} Campaign`,
      subject: landingPage.template_name || `${campaignType} Campaign`,
      landing_page: landingPage.landing_page_slug,
      template: landingPage.template_id,
      description: `${landingPage.template_name} - ${landingPage.ai_goal || 'Educational content'}`,
    },
    landing_page: landingPage,
    template: {
      template_id: landingPage.template_id,
      name: landingPage.template_name,
      slides: landingPage.slide_count,
      duration: landingPage.duration_seconds,
      purpose: campaignType.toLowerCase(),
      audio_required: true,
    },
    slides: [],
    presentation: {
      id: landingPage.landing_page_slug,
      audio: {
        baseUrl: landingPage.audio_base_url,
        format: 'mp3',
      },
      slides: [],
    },
  };

  // Write the file
  fs.writeFileSync(outputFile, JSON.stringify(campaignData, null, 2));
  generated++;
});

console.log(`✅ Generated ${generated} new campaign files`);
console.log(`⏭️  Skipped ${skipped} existing files`);
console.log(`📁 Output directory: ${outputDir}`);

