#!/usr/bin/env node

/**
 * Translation Restructuring Script
 * 
 * This script takes the monolithic translations file and splits it into
 * smaller, feature-specific files for better maintainability.
 * 
 * Usage:
 *   node restructure-translations.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const TRANSLATION_FILE = path.resolve(SRC_DIR, 'i18n/translations.ts');
const OUTPUT_DIR = path.resolve(SRC_DIR, 'i18n/locales');
const SUPPORTED_LANGUAGES = ['en', 'nl', 'fr', 'de'];

// Namespace mapping - define which keys go into which files
const NAMESPACE_MAPPING = {
  'common': [
    'common.',
    'app.',
    'actions.',
    'form.',
  ],
  'auth': [
    'auth.',
    'login.',
    'register.',
    'password.',
  ],
  'dashboard': [
    'dashboard.',
  ],
  'transactions': [
    'transactions.',
    'expense.',
    'income.',
  ],
  'budgets': [
    'budget.',
    'budgets.',
  ],
  'goals': [
    'goal.',
    'goals.',
  ],
  'bills': [
    'bill.',
    'bills.',
    'subscription.',
  ],
  'categories': [
    'category.',
    'categories.',
  ],
  'settings': [
    'settings.',
    'preferences.',
    'profile.',
  ],
  'groups': [
    'group.',
    'groups.',
  ],
  'nav': [
    'nav.',
    'menu.',
    'sidebar.',
  ],
  'errors': [
    'error.',
    'validation.',
  ],
};

// Main function
async function main() {
  console.log('🔄 Restructuring translations...');
  
  // 1. Load existing translations
  const translations = loadTranslations();
  
  // 2. Create output directory structure
  createDirectoryStructure();
  
  // 3. Split translations by namespace
  splitTranslations(translations);
  
  // 4. Generate index file
  generateIndexFile();
  
  console.log('✅ Translations restructured successfully!');
}

// Load existing translations from the translation file
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

// Create the directory structure for the new translation files
function createDirectoryStructure() {
  console.log('📁 Creating directory structure...');
  
  // Create the main output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Create language-specific directories
  for (const lang of SUPPORTED_LANGUAGES) {
    const langDir = path.join(OUTPUT_DIR, lang);
    
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
  }
}

// Split translations by namespace
function splitTranslations(translations) {
  console.log('✂️  Splitting translations by namespace...');
  
  for (const lang of SUPPORTED_LANGUAGES) {
    console.log(`Processing ${lang}...`);
    
    const langTranslations = translations[lang]?.translation || {};
    
    // Create a map to store translations by namespace
    const namespaceTranslations = {};
    
    // Initialize namespace objects
    for (const namespace of Object.keys(NAMESPACE_MAPPING)) {
      namespaceTranslations[namespace] = {};
    }
    
    // Categorize translations by namespace
    for (const key of Object.keys(langTranslations)) {
      let assigned = false;
      
      // Find the appropriate namespace
      for (const [namespace, prefixes] of Object.entries(NAMESPACE_MAPPING)) {
        for (const prefix of prefixes) {
          if (key.startsWith(prefix)) {
            namespaceTranslations[namespace][key] = langTranslations[key];
            assigned = true;
            break;
          }
        }
        
        if (assigned) break;
      }
      
      // If not assigned to any namespace, put in common
      if (!assigned) {
        namespaceTranslations.common[key] = langTranslations[key];
      }
    }
    
    // Write namespace files
    for (const [namespace, translations] of Object.entries(namespaceTranslations)) {
      const outputFile = path.join(OUTPUT_DIR, lang, `${namespace}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(translations, null, 2), 'utf8');
    }
  }
}

// Generate index file
function generateIndexFile() {
  console.log('📝 Generating index file...');
  
  const indexContent = `// This file is auto-generated by restructure-translations.js
// Do not edit manually

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  en: { nativeName: "English", flag: "🇬🇧" },
  nl: { nativeName: "Nederlands", flag: "🇳🇱" },
  fr: { nativeName: "Français", flag: "🇫🇷" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" },
};

// Define namespaces
export const NAMESPACES = [
${Object.keys(NAMESPACE_MAPPING).map(ns => `  "${ns}"`).join(',\n')}
];

// Import translations
${SUPPORTED_LANGUAGES.map(lang => `import ${lang}_common from "./locales/${lang}/common.json";`).join('\n')}

// Initialize resources with common namespace (others will be loaded on demand)
const resources = {
${SUPPORTED_LANGUAGES.map(lang => `  ${lang}: {
    common: ${lang}_common
  }`).join(',\n')}
};

// Initialize i18next
i18n
  // Load translations from backend for other namespaces
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize
  .init({
    resources,
    ns: ["common", ...NAMESPACES],
    defaultNS: "common",
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
    backend: {
      loadPath: "/src/i18n/locales/{{lng}}/{{ns}}.json",
    },
  });

export { i18n };

// Helper function to change language
export const changeLanguage = async (lang: string): Promise<void> => {
  await i18n.changeLanguage(lang);
  
  // Update localStorage
  try {
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      settings.language = lang;
      localStorage.setItem("userSettings", JSON.stringify(settings));
    } else {
      localStorage.setItem("userSettings", JSON.stringify({ language: lang }));
    }
  } catch (error) {
    console.error("Error updating user settings:", error);
  }
};

// Export a type-safe translation function
export const t = (key: string, options?: Record<string, any>): string => {
  return i18n.t(key, options);
};

// Export a hook for functional components
export const useTranslation = () => {
  return {
    t,
    i18n,
    changeLanguage,
  };
};`;
  
  const indexFile = path.join(SRC_DIR, 'i18n/index.new.ts');
  fs.writeFileSync(indexFile, indexContent, 'utf8');
  
  console.log(`✅ Generated new index file at ${indexFile}`);
  console.log('⚠️  Review the new index file and rename it to index.ts when ready');
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
