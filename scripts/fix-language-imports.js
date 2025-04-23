#!/usr/bin/env node

/**
 * Fix Language Imports Script
 * 
 * This script fixes imports of the removed language provider:
 * - Removes imports from LanguageProvider
 * - Removes useLanguage hooks
 * - Removes i18n imports
 * 
 * Usage:
 *   node fix-language-imports.js
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
  
  // Remove imports from LanguageProvider
  const languageProviderRegex = /import\s+.*\s+from\s+["'].*LanguageProvider["'];?/g;
  if (languageProviderRegex.test(content)) {
    content = content.replace(languageProviderRegex, '// Language provider import removed');
    modified = true;
  }
  
  // Remove imports from translations-loader
  const translationsLoaderRegex = /import\s+.*\s+from\s+["'].*translations-loader["'];?/g;
  if (translationsLoaderRegex.test(content)) {
    content = content.replace(translationsLoaderRegex, '// Translations loader import removed');
    modified = true;
  }
  
  // Remove useLanguage hooks
  const useLanguageRegex = /const\s+{\s*.*useLanguage.*\s*}\s*=\s*useLanguage\(\);?/g;
  if (useLanguageRegex.test(content)) {
    content = content.replace(useLanguageRegex, '// Language hooks removed');
    modified = true;
  }
  
  // Remove useLanguage destructuring
  const useLanguageDestructuringRegex = /,\s*useLanguage\s*/g;
  if (useLanguageDestructuringRegex.test(content)) {
    content = content.replace(useLanguageDestructuringRegex, ' ');
    modified = true;
  }
  
  // Remove single useLanguage import
  const singleUseLanguageRegex = /import\s+{\s*useLanguage\s*}\s*from\s+["'].*LanguageProvider["'];?/g;
  if (singleUseLanguageRegex.test(content)) {
    content = content.replace(singleUseLanguageRegex, '// Language import removed');
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
