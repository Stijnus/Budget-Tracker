-- Add language column to user_settings table
-- This script can be executed directly in the Supabase SQL editor

-- Add the language column if it doesn't exist
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Comment on the column for documentation
COMMENT ON COLUMN user_settings.language IS 'User preferred language';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_settings' AND column_name = 'language';
