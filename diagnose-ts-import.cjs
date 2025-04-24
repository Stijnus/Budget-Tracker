// diagnose-ts-import.js
const fs = require('fs');
const path = require('path');

const groupBudgetsPath = path.resolve(__dirname, 'src/api/supabase/groupBudgets.ts');
const dbTypesPath = path.resolve(__dirname, 'src/lib/database.types.ts');
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');

function checkFile(filePath) {
  console.log(`\nChecking: ${filePath}`);
  if (fs.existsSync(filePath)) {
    console.log('✅ File exists.');
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log('--- File Start ---');
      console.log(content.split('\n').slice(0, 20).join('\n'));
      console.log('--- File End (truncated) ---');
    } catch (err) {
      console.error('❌ Error reading file:', err);
    }
  } else {
    console.error('❌ File does not exist!');
  }
}

function tryImport(filePath) {
  try {
    require(filePath);
    console.log(`✅ Successfully imported ${filePath}`);
  } catch (err) {
    console.error(`❌ Could not import ${filePath}:`, err.message);
  }
}

console.log('=== TypeScript Import Diagnostic Script ===');

checkFile(groupBudgetsPath);
checkFile(dbTypesPath);
checkFile(tsconfigPath);

console.log('\n--- Attempting to import groupBudgets.ts (may fail if not JS-compatible) ---');
tryImport(groupBudgetsPath);

console.log('\n--- Done ---');
