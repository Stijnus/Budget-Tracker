#!/bin/bash

# Apply migrations to the Supabase database
# This script requires the Supabase CLI to be installed

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
fi

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Required environment variables are not set."
  echo "Please make sure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set in your .env file."
  exit 1
fi

# Apply migrations
echo "Applying migrations to Supabase..."

# Execute the SQL migration directly using the Supabase REST API
echo "Adding language column to user_settings table..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"query": "ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT '\'en'\';"}'

if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
else
  echo "Error applying migration."
  exit 1
fi

# Generate updated types
echo "Generating updated TypeScript types..."
npm run types:generate

echo "Done!"
