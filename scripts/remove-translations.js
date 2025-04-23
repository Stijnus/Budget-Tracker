#!/usr/bin/env node

/**
 * Remove Translations Script
 * 
 * This script removes all translation-related code from the codebase:
 * - Removes imports from react-i18next
 * - Replaces t() calls with direct text
 * - Removes useTranslation hooks
 * 
 * Usage:
 *   node remove-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

// Function to process a file
function processFile(filePath) {
  console.log(`Processing ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Remove imports from react-i18next
  const importRegex = /import\s+.*\s+from\s+["']react-i18next["'];?/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, '// Translation imports removed');
    modified = true;
  }
  
  // Remove useTranslation hooks
  const hookRegex = /const\s+{\s*t\s*(?:,\s*i18n)?\s*}\s*=\s*useTranslation\(\);?/g;
  if (hookRegex.test(content)) {
    content = content.replace(hookRegex, '// Translation hooks removed');
    modified = true;
  }
  
  // Replace t() calls with direct text
  // This is a simplified approach - in a real implementation, you'd need more sophisticated parsing
  const translationRegex = /t\(["'](.*?)\.([^."']+)["']\)/g;
  let match;
  
  while ((match = translationRegex.exec(content)) !== null) {
    const fullKey = match[0];
    const namespace = match[1];
    const key = match[2];
    
    // Convert the key to a human-readable format
    const humanReadable = key
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Replace the t() call with the human-readable text
    content = content.replace(fullKey, `"${humanReadable}"`);
    modified = true;
  }
  
  // Replace simple t() calls without namespace
  const simpleTranslationRegex = /t\(["']([^."']+)["']\)/g;
  while ((match = simpleTranslationRegex.exec(content)) !== null) {
    const fullKey = match[0];
    const key = match[1];
    
    // Convert the key to a human-readable format
    const humanReadable = key
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Replace the t() call with the human-readable text
    content = content.replace(fullKey, `"${humanReadable}"`);
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Updated ${filePath}`);
  }
}

// Function to find and process all files
async function processAllFiles() {
  const files = await glob('**/*.{ts,tsx}', {
    cwd: SRC_DIR,
    ignore: ['**/node_modules/**'],
    absolute: true
  });
  
  console.log(`Found ${files.length} files to process`);
  
  for (const file of files) {
    processFile(file);
  }
  
  console.log('Processing complete!');
}

// Run the script
processAllFiles().catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
});
