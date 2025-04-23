-- Add family roles to group_members table
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS family_role TEXT CHECK (family_role IN ('parent', 'child', 'guardian', 'other'));

-- Update the group_members type in the database.types.ts file
COMMENT ON TABLE group_members IS 'Table for storing group members with their roles and family roles';
COMMENT ON COLUMN group_members.family_role IS 'Optional family role for family budget groups (parent, child, guardian, other)';

-- Create or update RLS policies for family role management
-- Only group owners and admins can update family roles
CREATE POLICY IF NOT EXISTS "Group owners and admins can update family roles"
    ON group_members FOR UPDATE
    USING (
        group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
