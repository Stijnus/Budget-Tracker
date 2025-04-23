// Script to apply SQL directly to the Supabase database
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing environment variable: SUPABASE_URL');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applySql() {
  try {
    console.log('Reading SQL files...');
    
    // Read the add_group_owner_function.sql file
    const functionFilePath = path.join(__dirname, '..', 'supabase', 'add_group_owner_function.sql');
    const functionContent = fs.readFileSync(functionFilePath, 'utf8');
    
    console.log('Creating add_group_owner function...');
    
    // Execute the SQL directly using the Postgres extension
    const { error } = await supabase.rpc('exec_sql', { sql: functionContent });
    
    if (error) {
      // If exec_sql function doesn't exist, we need to create it first
      if (error.message.includes('function exec_sql() does not exist')) {
        console.log('exec_sql function does not exist, creating it first...');
        
        // Read the create_exec_sql_function.sql file
        const execSqlFilePath = path.join(__dirname, '..', 'supabase', 'create_exec_sql_function.sql');
        const execSqlContent = fs.readFileSync(execSqlFilePath, 'utf8');
        
        // Execute the SQL directly using the Postgres extension
        const { data, error: pgError } = await supabase.postgres.query(execSqlContent);
        
        if (pgError) {
          console.error('Error creating exec_sql function:', pgError);
          process.exit(1);
        }
        
        console.log('exec_sql function created successfully!');
        
        // Now try to create the add_group_owner function again
        const { error: retryError } = await supabase.rpc('exec_sql', { sql: functionContent });
        
        if (retryError) {
          console.error('Error creating add_group_owner function:', retryError);
          process.exit(1);
        }
      } else {
        console.error('Error creating add_group_owner function:', error);
        process.exit(1);
      }
    }
    
    console.log('add_group_owner function created successfully!');
    
    // Now apply the RLS policy fix
    console.log('Applying RLS policy fix...');
    
    // Read the fix_group_members_policy.sql file
    const policyFilePath = path.join(__dirname, '..', 'supabase', 'fix_group_members_policy.sql');
    const policyContent = fs.readFileSync(policyFilePath, 'utf8');
    
    // Execute the SQL
    const { error: policyError } = await supabase.rpc('exec_sql', { sql: policyContent });
    
    if (policyError) {
      console.error('Error applying RLS policy fix:', policyError);
      process.exit(1);
    }
    
    console.log('RLS policy fix applied successfully!');
    
    // Verify the function and policy were created
    console.log('Verifying changes...');
    
    const { data: functionData, error: functionError } = await supabase.rpc('exec_sql', { 
      sql: "SELECT proname, prosrc FROM pg_proc WHERE proname = 'add_group_owner'" 
    });
    
    if (functionError) {
      console.error('Error verifying add_group_owner function:', functionError);
    } else {
      console.log('add_group_owner function verification:', functionData);
    }
    
    const { data: policyData, error: policyVerifyError } = await supabase.rpc('exec_sql', { 
      sql: "SELECT * FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Users can add members to groups'" 
    });
    
    if (policyVerifyError) {
      console.error('Error verifying RLS policy:', policyVerifyError);
    } else {
      console.log('RLS policy verification:', policyData);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

applySql();
