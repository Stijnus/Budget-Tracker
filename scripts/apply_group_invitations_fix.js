// Script to apply the group_invitations fix to the Supabase database
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
// For Supabase Management API, we need an access token, not the service role key
// This script assumes you're using the service role key as the access token
const accessToken =
  process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectId = process.env.SUPABASE_PROJECT_ID;

if (!supabaseUrl) {
  console.error("Missing environment variable: SUPABASE_URL");
  process.exit(1);
}

if (!accessToken) {
  console.error(
    "Missing environment variable: SUPABASE_ACCESS_TOKEN or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

if (!projectId) {
  console.error("Missing environment variable: SUPABASE_PROJECT_ID");
  process.exit(1);
}

async function applyGroupInvitationsFix() {
  try {
    console.log("Reading SQL file...");
    const sqlFilePath = path.join(
      __dirname,
      "..",
      "supabase",
      "fix_group_invitations.sql"
    );
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    console.log("Applying SQL fix...");

    // Use the Supabase REST API directly instead of the Management API
    // This approach uses the service role key which has full access to the database
    const response = await axios.post(
      `${supabaseUrl}/rest/v1/rpc/exec_sql`,
      { sql: sqlContent },
      {
        headers: {
          apikey: accessToken,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
      }
    );

    console.log("SQL fix applied successfully!");
    console.log("Response:", response.data);

    // Verify the function was created
    const verifyResponse = await axios.post(
      `${supabaseUrl}/rest/v1/rpc/exec_sql`,
      {
        sql: "SELECT proname, prosrc FROM pg_proc WHERE proname = 'generate_invitation_token'",
      },
      {
        headers: {
          apikey: accessToken,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      }
    );

    console.log("Function verification result:", verifyResponse.data);
  } catch (err) {
    console.error(
      "Error applying SQL fix:",
      err.response?.data || err.message
    );
    process.exit(1);
  }
}

applyGroupInvitationsFix();
