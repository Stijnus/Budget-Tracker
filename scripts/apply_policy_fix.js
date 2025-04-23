// Script to apply the group_members policy fix to the Supabase database
import { config } from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

config();

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.SUPABASE_PROJECT_ID;

if (!supabaseUrl) {
  console.error("Missing environment variable: SUPABASE_URL");
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!projectId) {
  console.error("Missing environment variable: SUPABASE_PROJECT_ID");
  process.exit(1);
}

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

    // Use the Supabase Management API to execute SQL
    const response = await axios.post(
      `https://api.supabase.com/v1/projects/${projectId}/database/query`,
      { query: sqlContent },
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SQL fix applied successfully!");
    console.log("Response:", response.data);

    // Verify the policy was created
    const verifyResponse = await axios.post(
      `https://api.supabase.com/v1/projects/${projectId}/database/query`,
      {
        query:
          "SELECT * FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Users can add members to groups'",
      },
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Policy verification result:", verifyResponse.data);
  } catch (err) {
    console.error("Error applying SQL fix:", err.response?.data || err.message);
    process.exit(1);
  }
}

applyPolicyFix();
