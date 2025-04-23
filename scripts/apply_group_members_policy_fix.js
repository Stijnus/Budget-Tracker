// Script to apply the group_members policy fix to the Supabase database
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("Missing environment variable: VITE_SUPABASE_URL");
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyPolicyFix() {
  try {
    console.log("Reading SQL file...");
    const sqlFilePath = path.join(
      __dirname,
      "..",
      "supabase",
      "fix_group_members_policy.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    console.log("Applying SQL fix...");
    const { error } = await supabase.rpc("exec_sql", { sql: sqlContent });

    if (error) {
      console.error("Error applying SQL fix:", error);
      process.exit(1);
    }

    console.log("SQL fix applied successfully!");

    // Verify the policy was created
    const { data, error: policyError } = await supabase.rpc("exec_sql", {
      sql: "SELECT * FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Users can add members to groups'",
    });

    if (policyError) {
      console.error("Error verifying policy:", policyError);
    } else {
      console.log("Policy verification result:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

applyPolicyFix();
