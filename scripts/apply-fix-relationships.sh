#!/bin/bash

# Apply the fix-relationships migration to the Supabase database
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

# Apply the migration using the Supabase REST API
echo "Applying fix-relationships migration..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "query": "$(cat supabase/migrations/20240701_fix_relationships.sql | tr '\n' ' ')"
}
EOF

echo -e "\nMigration applied successfully!"
