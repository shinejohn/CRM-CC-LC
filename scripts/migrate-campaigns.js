#!/usr/bin/env node

/**
 * Migration script to copy complete campaign files from realcontent/ to public/campaigns/
 * Removes "_complete" suffix and ensures proper structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '../realcontent');
const TARGET_DIR = path.join(__dirname, '../public/campaigns');

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Get all complete campaign files
const sourceFiles = fs.readdirSync(SOURCE_DIR)
  .filter(file => file.startsWith('campaign_') && file.endsWith('_complete.json'));

console.log(`Found ${sourceFiles.length} complete campaign files to migrate...`);

let migrated = 0;
let errors = 0;

sourceFiles.forEach(sourceFile => {
  try {
    // Read source file
    const sourcePath = path.join(SOURCE_DIR, sourceFile);
    const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    
    // Generate target filename (remove "_complete" suffix)
    const targetFile = sourceFile.replace('_complete.json', '.json');
    const targetPath = path.join(TARGET_DIR, targetFile);
    
    // Transform the data structure if needed
    // The complete files already have the correct structure, but we ensure slides have proper format
    const transformedData = {
      ...sourceData,
      slides: sourceData.slides?.map((slide, index) => ({
        ...slide,
        slide_num: slide.slide_num || index + 1,
        // Ensure component name is preserved
        component: slide.component,
        // Ensure content exists
        content: slide.content || {},
        // Ensure narration exists
        narration: slide.narration || '',
        // Ensure audio_file exists
        audio_file: slide.audio_file || `slide-${String(slide.slide_num || index + 1).padStart(2, '0')}.mp3`,
        // Ensure duration_seconds exists
        duration_seconds: slide.duration_seconds || 20,
      })) || [],
    };
    
    // Write to target
    fs.writeFileSync(targetPath, JSON.stringify(transformedData, null, 2), 'utf8');
    
    console.log(`✓ Migrated ${sourceFile} → ${targetFile}`);
    migrated++;
  } catch (error) {
    console.error(`✗ Error migrating ${sourceFile}:`, error.message);
    errors++;
  }
});

console.log(`\nMigration complete!`);
console.log(`  Migrated: ${migrated}`);
console.log(`  Errors: ${errors}`);
console.log(`\nFiles are now in: ${TARGET_DIR}`);

