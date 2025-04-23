// Script to create the exec_sql function in the Supabase database
import { config } from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const accessToken = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing environment variable: SUPABASE_URL');
  process.exit(1);
}

if (!accessToken) {
  console.error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function createExecSqlFunction() {
  try {
    console.log('Reading SQL file...');
    const functionFilePath = path.join(__dirname, '..', 'supabase', 'create_exec_sql_function.sql');
    const functionContent = fs.readFileSync(functionFilePath, 'utf8');

    console.log('Creating exec_sql function...');
    
    // Use the Supabase REST API directly
    const response = await axios.post(
      `${supabaseUrl}/rest/v1/`,
      functionContent,
      {
        headers: {
          'apikey': accessToken,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/sql',
          'Prefer': 'return=minimal'
        }
      }
    );

    console.log('exec_sql function created successfully!');
    console.log('Response:', response.data);
    
  } catch (err) {
    console.error('Error creating exec_sql function:', err.response?.data || err.message);
    process.exit(1);
  }
}

createExecSqlFunction();
