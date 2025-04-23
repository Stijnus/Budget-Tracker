#!/usr/bin/env node

/**
 * Translation Validation Script
 * 
 * This script scans the codebase for translation keys and compares them with
 * the available translations to identify missing or unused translations.
 * 
 * Usage:
 *   node validate-translations.mjs
 * 
 * Options:
 *   --fix       Generate placeholder entries for missing translations
 *   --verbose   Show detailed information about each key
 *   --lang=xx   Check only specific language (e.g., --lang=fr)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const TRANSLATION_FILE = path.resolve(SRC_DIR, 'i18n/translations.ts');
const SUPPORTED_LANGUAGES = ['en', 'nl', 'fr', 'de'];
const EXTRACT_PATTERN = /t\(['"]([^'"]+)['"]/g;
const EXTRACT_PATTERN_ALT = /\{\s*t\(['"]([^'"]+)['"]\s*\)/g;

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  verbose: args.includes('--verbose'),
  lang: args.find(arg => arg.startsWith('--lang='))?.split('=')[1] || null
};

// Filter languages if specified
const languages = options.lang 
  ? [options.lang]
  : SUPPORTED_LANGUAGES;

// Main function
async function main() {
  console.log('🔍 Validating translations...');
  
  // 1. Extract all translation keys from the codebase
  const usedKeys = await extractTranslationKeys();
  console.log(`Found ${usedKeys.size} unique translation keys in the codebase.`);
  
  // 2. Load existing translations
  const translations = loadTranslations();
  
  // 3. Check for missing translations
  const missingTranslations = findMissingTranslations(usedKeys, translations, languages);
  
  // 4. Check for unused translations
  const unusedTranslations = findUnusedTranslations(usedKeys, translations, languages);
  
  // 5. Report results
  reportResults(missingTranslations, unusedTranslations);
  
  // 6. Fix missing translations if requested
  if (options.fix && Object.keys(missingTranslations).length > 0) {
    fixMissingTranslations(missingTranslations, translations);
  }
}

// Extract all translation keys used in the codebase
async function extractTranslationKeys() {
  const files = globSync(`${SRC_DIR}/**/*.{ts,tsx,js,jsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
  
  const keys = new Set();
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Extract keys from t('key') pattern
    let match;
    const regex1 = new RegExp(EXTRACT_PATTERN);
    while ((match = regex1.exec(content)) !== null) {
      keys.add(match[1]);
    }
    
    // Extract keys from {t('key')} pattern
    const regex2 = new RegExp(EXTRACT_PATTERN_ALT);
    while ((match = regex2.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  
  return keys;
}

// Load existing translations from the translation file
function loadTranslations() {
  try {
    const content = fs.readFileSync(TRANSLATION_FILE, 'utf8');
    
    // Extract the translations object using regex
    // This is a simple approach - for more complex files, consider using a TS parser
    const translationsMatch = content.match(/export const translations = ({[\s\S]*?});/);
    
    if (!translationsMatch) {
      console.error('❌ Could not find translations object in the file.');
      process.exit(1);
    }
    
    // Evaluate the extracted object (careful with this approach in general)
    // For a more robust solution, use a proper TS/JS parser
    const translationsStr = translationsMatch[1]
      .replace(/\/\/.*$/gm, '') // Remove comments
      .replace(/,(\s*[}\]])/g, '$1'); // Fix trailing commas
      
    // Use Function constructor to evaluate the object
    // Note: This is generally not safe for untrusted input
    const translationsObj = new Function(`return ${translationsStr}`)();
    
    return translationsObj;
  } catch (error) {
    console.error('❌ Error loading translations:', error.message);
    process.exit(1);
  }
}

// Find missing translations
function findMissingTranslations(usedKeys, translations, languages) {
  const missing = {};
  
  for (const lang of languages) {
    missing[lang] = [];
    
    for (const key of usedKeys) {
      const keyParts = key.split('.');
      let current = translations[lang]?.translation;
      
      // Navigate through nested keys
      let isMissing = false;
      for (const part of keyParts) {
        if (!current || current[part] === undefined) {
          isMissing = true;
          break;
        }
        current = current[part];
      }
      
      if (isMissing) {
        missing[lang].push(key);
      }
    }
  }
  
  return missing;
}

// Find unused translations
function findUnusedTranslations(usedKeys, translations, languages) {
  const unused = {};
  
  for (const lang of languages) {
    unused[lang] = [];
    
    // Flatten the translation object to get all keys
    const flattenedKeys = flattenObject(translations[lang]?.translation || {});
    
    for (const key of Object.keys(flattenedKeys)) {
      if (!usedKeys.has(key)) {
        unused[lang].push(key);
      }
    }
  }
  
  return unused;
}

// Flatten a nested object into a single-level object with dot notation keys
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }
    
    return acc;
  }, {});
}

// Report results
function reportResults(missingTranslations, unusedTranslations) {
  let hasMissing = false;
  let hasUnused = false;
  
  // Report missing translations
  console.log('\n📊 Translation Status:');
  
  for (const lang of Object.keys(missingTranslations)) {
    const missing = missingTranslations[lang];
    
    if (missing.length > 0) {
      hasMissing = true;
      console.log(`\n❌ Missing translations for ${lang.toUpperCase()} (${missing.length}):`);
      
      if (options.verbose || missing.length <= 10) {
        missing.forEach(key => console.log(`  - ${key}`));
      } else {
        missing.slice(0, 10).forEach(key => console.log(`  - ${key}`));
        console.log(`  ... and ${missing.length - 10} more`);
      }
    } else {
      console.log(`✅ ${lang.toUpperCase()}: All translations present`);
    }
  }
  
  // Report unused translations
  console.log('\n🗑️  Unused Translations:');
  
  for (const lang of Object.keys(unusedTranslations)) {
    const unused = unusedTranslations[lang];
    
    if (unused.length > 0) {
      hasUnused = true;
      console.log(`\n⚠️  Unused translations for ${lang.toUpperCase()} (${unused.length}):`);
      
      if (options.verbose || unused.length <= 5) {
        unused.forEach(key => console.log(`  - ${key}`));
      } else {
        unused.slice(0, 5).forEach(key => console.log(`  - ${key}`));
        console.log(`  ... and ${unused.length - 5} more`);
      }
    } else {
      console.log(`✅ ${lang.toUpperCase()}: No unused translations`);
    }
  }
  
  // Summary
  console.log('\n📝 Summary:');
  if (!hasMissing && !hasUnused) {
    console.log('✅ All translations are complete and in use!');
  } else {
    if (hasMissing) {
      console.log('❌ There are missing translations that need to be added.');
    }
    if (hasUnused) {
      console.log('⚠️  There are unused translations that could be removed.');
    }
    
    if (options.fix) {
      console.log('\n🔧 Running in fix mode - will generate placeholders for missing translations.');
    } else {
      console.log('\n💡 Tip: Run with --fix to generate placeholders for missing translations.');
    }
  }
}

// Fix missing translations by adding placeholders
function fixMissingTranslations(missingTranslations, translations) {
  console.log('\n🔧 Fixing missing translations...');
  
  let updated = false;
  
  // Add missing translations with placeholders
  for (const lang of Object.keys(missingTranslations)) {
    const missing = missingTranslations[lang];
    
    if (missing.length > 0) {
      console.log(`Adding ${missing.length} placeholders for ${lang}...`);
      
      for (const key of missing) {
        // Get English value as reference if available
        const englishValue = getNestedValue(translations.en?.translation || {}, key.split('.'));
        const placeholder = englishValue || `[${key}]`;
        
        // Set the placeholder value
        setNestedValue(translations[lang].translation, key.split('.'), placeholder);
        updated = true;
      }
    }
  }
  
  if (updated) {
    // Convert translations back to string and save
    const translationsStr = `// Define the translations for all supported languages
export const translations = ${JSON.stringify(translations, null, 2)};`;
    
    fs.writeFileSync(TRANSLATION_FILE, translationsStr, 'utf8');
    console.log('✅ Updated translations file with placeholders.');
  } else {
    console.log('✅ No updates needed.');
  }
}

// Get a nested value from an object using an array of keys
function getNestedValue(obj, keys) {
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

// Set a nested value in an object using an array of keys
function setNestedValue(obj, keys, value) {
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    if (current[key] === undefined) {
      current[key] = {};
    }
    
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
