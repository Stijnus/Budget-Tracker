#!/usr/bin/env node

/**
 * Translation Audit Script
 * 
 * This script analyzes the codebase to find hardcoded text that should be translated.
 * It looks for JSX text content that isn't wrapped in translation functions.
 * 
 * Usage:
 *   node audit-translations.js
 * 
 * Options:
 *   --fix       Generate translation keys for hardcoded text
 *   --verbose   Show detailed information
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const TRANSLATION_FILE = path.resolve(SRC_DIR, 'i18n/translations.ts');
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'i18n',
  '*.test.*',
  '*.spec.*',
  '*.d.ts',
];

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  fix: args.includes('--fix'),
  verbose: args.includes('--verbose'),
};

// Main function
async function main() {
  console.log('🔍 Auditing translations...');
  
  // 1. Find all React component files
  const files = findComponentFiles();
  console.log(`Found ${files.length} component files to analyze.`);
  
  // 2. Analyze each file for hardcoded text
  const results = await analyzeFiles(files);
  
  // 3. Report results
  reportResults(results);
  
  // 4. Fix hardcoded text if requested
  if (options.fix) {
    fixHardcodedText(results);
  }
}

// Find all React component files
function findComponentFiles() {
  const pattern = `${SRC_DIR}/**/*.{tsx,jsx}`;
  const ignorePattern = IGNORE_PATTERNS.map(p => `**/${p}/**`);
  
  return glob.sync(pattern, { ignore: ignorePattern });
}

// Analyze files for hardcoded text
async function analyzeFiles(files) {
  const results = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(SRC_DIR, file);
      
      // Parse the file
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });
      
      // Find hardcoded text
      const hardcodedText = [];
      
      traverse(ast, {
        JSXText(path) {
          const text = path.node.value.trim();
          
          // Skip empty text or text that's just whitespace
          if (!text || /^[\s\r\n]+$/.test(text)) {
            return;
          }
          
          // Skip very short text (likely not needing translation)
          if (text.length < 3) {
            return;
          }
          
          // Skip text that looks like code or is just punctuation
          if (/^[{}<>()[\].,;:!?]+$/.test(text)) {
            return;
          }
          
          // Check if this text is already inside a translation function
          let isTranslated = false;
          let current = path.parentPath;
          
          while (current && !isTranslated) {
            if (current.isJSXExpressionContainer()) {
              const expression = current.node.expression;
              
              if (
                t.isCallExpression(expression) &&
                (
                  (t.isIdentifier(expression.callee) && expression.callee.name === 't') ||
                  (t.isMemberExpression(expression.callee) && 
                   t.isIdentifier(expression.callee.property) && 
                   expression.callee.property.name === 't')
                )
              ) {
                isTranslated = true;
              }
            }
            
            current = current.parentPath;
          }
          
          if (!isTranslated) {
            hardcodedText.push({
              text,
              location: {
                start: path.node.start,
                end: path.node.end,
              },
              path: path,
            });
          }
        },
        
        // Also check for hardcoded strings in component props
        JSXAttribute(path) {
          const name = path.node.name.name;
          
          // Skip certain attributes that don't need translation
          if (['className', 'style', 'id', 'key', 'type', 'href', 'src', 'alt', 'placeholder'].includes(name)) {
            return;
          }
          
          // Check if the value is a string literal
          if (path.node.value && t.isStringLiteral(path.node.value)) {
            const text = path.node.value.value.trim();
            
            // Skip empty or very short text
            if (!text || text.length < 3) {
              return;
            }
            
            // Skip text that looks like code or is just punctuation
            if (/^[{}<>()[\].,;:!?]+$/.test(text)) {
              return;
            }
            
            hardcodedText.push({
              text,
              location: {
                start: path.node.value.start,
                end: path.node.value.end,
              },
              path: path,
              isAttribute: true,
              attributeName: name,
            });
          }
        },
      });
      
      if (hardcodedText.length > 0) {
        results.push({
          file: relativePath,
          hardcodedText,
        });
      }
    } catch (error) {
      console.error(`Error analyzing ${file}:`, error.message);
    }
  }
  
  return results;
}

// Report results
function reportResults(results) {
  const totalFiles = results.length;
  const totalHardcodedText = results.reduce((sum, result) => sum + result.hardcodedText.length, 0);
  
  console.log('\n📊 Translation Audit Results:');
  console.log(`Found ${totalHardcodedText} instances of hardcoded text in ${totalFiles} files.`);
  
  if (totalHardcodedText === 0) {
    console.log('✅ No hardcoded text found!');
    return;
  }
  
  // Show detailed results
  if (options.verbose || totalFiles <= 5) {
    console.log('\nDetailed Results:');
    
    for (const result of results) {
      console.log(`\n📄 ${result.file} (${result.hardcodedText.length} instances):`);
      
      for (const item of result.hardcodedText) {
        if (item.isAttribute) {
          console.log(`  - Attribute "${item.attributeName}": "${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}"`);
        } else {
          console.log(`  - Text: "${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}"`);
        }
      }
    }
  } else {
    // Show summary of top files
    const topFiles = [...results]
      .sort((a, b) => b.hardcodedText.length - a.hardcodedText.length)
      .slice(0, 5);
    
    console.log('\nTop Files with Hardcoded Text:');
    
    for (const result of topFiles) {
      console.log(`  - ${result.file}: ${result.hardcodedText.length} instances`);
    }
    
    console.log('\nRun with --verbose to see all results.');
  }
  
  // Suggestion
  if (options.fix) {
    console.log('\n🔧 Running in fix mode - will generate suggestions for hardcoded text.');
  } else {
    console.log('\n💡 Tip: Run with --fix to generate suggestions for hardcoded text.');
  }
}

// Fix hardcoded text
function fixHardcodedText(results) {
  console.log('\n🔧 Generating translation suggestions...');
  
  // Load existing translations
  const translations = loadTranslations();
  const existingKeys = new Set(Object.keys(translations.en.translation));
  
  // Generate suggestions for each file
  for (const result of results) {
    console.log(`\nSuggestions for ${result.file}:`);
    
    for (const item of result.hardcodedText) {
      // Generate a key based on the text
      const key = generateTranslationKey(item.text, result.file, existingKeys);
      
      // Add to existing keys to avoid duplicates
      existingKeys.add(key);
      
      // Suggest the translation
      if (item.isAttribute) {
        console.log(`  - Replace attribute "${item.attributeName}="${item.text}" with:`);
        console.log(`    ${item.attributeName}={t("${key}")}`);
      } else {
        console.log(`  - Replace text "${item.text}" with:`);
        console.log(`    {t("${key}")}`);
      }
      
      // Add to translations
      if (!translations.en.translation[key]) {
        translations.en.translation[key] = item.text;
        
        // Add placeholder for other languages
        for (const lang of Object.keys(translations)) {
          if (lang !== 'en' && translations[lang]?.translation) {
            translations[lang].translation[key] = `[${key}]`;
          }
        }
      }
    }
  }
  
  // Save updated translations
  if (options.fix) {
    saveTranslations(translations);
    console.log('\n✅ Added new translation keys to the translations file.');
    console.log('⚠️  Remember to provide proper translations for non-English languages!');
  }
}

// Load existing translations
function loadTranslations() {
  try {
    const content = fs.readFileSync(TRANSLATION_FILE, 'utf8');
    
    // Extract the translations object using regex
    const translationsMatch = content.match(/export const translations = ({[\s\S]*?});/);
    
    if (!translationsMatch) {
      console.error('❌ Could not find translations object in the file.');
      process.exit(1);
    }
    
    // Evaluate the extracted object
    const translationsStr = translationsMatch[1]
      .replace(/\/\/.*$/gm, '') // Remove comments
      .replace(/,(\s*[}\]])/g, '$1'); // Fix trailing commas
      
    // Use Function constructor to evaluate the object
    const translationsObj = new Function(`return ${translationsStr}`)();
    
    return translationsObj;
  } catch (error) {
    console.error('❌ Error loading translations:', error.message);
    process.exit(1);
  }
}

// Save updated translations
function saveTranslations(translations) {
  try {
    const translationsStr = `// Define the translations for all supported languages
export const translations = ${JSON.stringify(translations, null, 2)};`;
    
    fs.writeFileSync(TRANSLATION_FILE, translationsStr, 'utf8');
  } catch (error) {
    console.error('❌ Error saving translations:', error.message);
  }
}

// Generate a translation key based on text and file path
function generateTranslationKey(text, filePath, existingKeys) {
  // Extract component or page name from file path
  let namespace = 'common';
  
  if (filePath.includes('/features/')) {
    const match = filePath.match(/\/features\/([^/]+)/);
    if (match) {
      namespace = match[1];
    }
  } else if (filePath.includes('/pages/')) {
    namespace = 'pages';
  } else if (filePath.includes('/shared/')) {
    namespace = 'shared';
  }
  
  // Extract component name
  const fileName = path.basename(filePath, path.extname(filePath));
  let component = fileName
    .replace(/Page$/, '')
    .replace(/Component$/, '')
    .replace(/([A-Z])/g, (match, letter) => letter.toLowerCase());
  
  // Generate key from text
  let key = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 20);
  
  // Combine namespace, component, and key
  let translationKey = `${namespace}.${component}.${key}`;
  
  // Ensure key is unique
  let counter = 1;
  let originalKey = translationKey;
  
  while (existingKeys.has(translationKey)) {
    translationKey = `${originalKey}_${counter}`;
    counter++;
  }
  
  return translationKey;
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
