-- Add metadata column to group_invitations table
ALTER TABLE group_invitations ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add comment to explain the purpose of the metadata column
COMMENT ON COLUMN group_invitations.metadata IS 'JSON metadata for additional invitation information like family roles';

-- Update the group_invitations type in the database.types.ts file
COMMENT ON TABLE group_invitations IS 'Table for storing group invitations with metadata support for family roles';
