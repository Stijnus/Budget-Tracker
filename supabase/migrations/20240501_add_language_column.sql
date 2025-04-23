-- Add language column to user_settings table
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Update the database types to include the language field
COMMENT ON COLUMN user_settings.language IS 'User preferred language';
