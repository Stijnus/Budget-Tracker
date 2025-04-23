#!/usr/bin/env node

/**
 * Fix Syntax Errors Script
 *
 * This script fixes syntax errors introduced by the remove-translations.js script:
 * - Fixes .selec"*" to .select("*")
 * - Fixes .spli"T"[0] to .split("T")[0]
 * - Fixes other syntax errors
 *
 * Usage:
 *   node fix-syntax-errors.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, "../src");

// Function to process a file
function processFile(filePath) {
  console.log(`Processing ${filePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Fix .selec"*" to .select("*")
  const selectRegex = /\.selec"([^"]+)"/g;
  if (selectRegex.test(content)) {
    content = content.replace(selectRegex, '.select("$1")');
    modified = true;
  }

  // Fix .spli"T"[0] to .split("T")[0]
  const splitRegex = /\.spli"T"\[0\]/g;
  if (splitRegex.test(content)) {
    content = content.replace(splitRegex, '.split("T")[0]');
    modified = true;
  }

  // Fix .ge"Type" to .get("Type")
  const getRegex = /\.ge"([^"]+)"/g;
  if (getRegex.test(content)) {
    content = content.replace(getRegex, '.get("$1")');
    modified = true;
  }

  // Fix showItemDeletedToas"Bank account" to showItemDeletedToast("Bank account")
  const toastRegex = /showItemDeletedToas"([^"]+)"/g;
  if (toastRegex.test(content)) {
    content = content.replace(toastRegex, 'showItemDeletedToast("$1")');
    modified = true;
  }

  // Fix showItemUpdatedToas"Bank account" to showItemUpdatedToast("Bank account")
  const updateToastRegex = /showItemUpdatedToas"([^"]+)"/g;
  if (updateToastRegex.test(content)) {
    content = content.replace(updateToastRegex, 'showItemUpdatedToast("$1")');
    modified = true;
  }

  // Fix showItemCreatedToas"Bank account" to showItemCreatedToast("Bank account")
  const createToastRegex = /showItemCreatedToas"([^"]+)"/g;
  if (createToastRegex.test(content)) {
    content = content.replace(createToastRegex, 'showItemCreatedToast("$1")');
    modified = true;
  }

  // Fix showErrorToas"Failed to delete bank account" to showErrorToast("Failed to delete bank account")
  const errorToastRegex = /showErrorToas"([^"]+)"/g;
  if (errorToastRegex.test(content)) {
    content = content.replace(errorToastRegex, 'showErrorToast("$1")');
    modified = true;
  }

  // Fix handleRangeSelec"This Month" to handleRangeSelect("This Month")
  const handleRangeRegex = /handleRangeSelec"([^"]+)"/g;
  if (handleRangeRegex.test(content)) {
    content = content.replace(handleRangeRegex, 'handleRangeSelect("$1")');
    modified = true;
  }

  // Fix item.date.spli" " to item.date.split(" ")
  const splitSpaceRegex = /\.spli" "/g;
  if (splitSpaceRegex.test(content)) {
    content = content.replace(splitSpaceRegex, '.split(" ")');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`  Updated ${filePath}`);
  }
}

// Function to find and process all files
async function processAllFiles() {
  const files = await glob("**/*.{ts,tsx}", {
    cwd: SRC_DIR,
    ignore: ["**/node_modules/**"],
    absolute: true,
  });

  console.log(`Found ${files.length} files to process`);

  for (const file of files) {
    processFile(file);
  }

  console.log("Processing complete!");
}

// Run the script
processAllFiles().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
