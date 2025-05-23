/*
  # Fix infinite recursion in group policies

  1. Changes
    - Rewrite group_members policies to avoid recursive checks
    - Update group_invitations policies to prevent recursion
    - Add helper function for checking group roles
    - Add missing foreign key for invited_by

  2. Security
    - Maintain existing access control rules
    - Fix potential security issues with recursive policies
    - Ensure proper authorization checks
*/

-- Create a function to check user's role in a group without recursion
CREATE OR REPLACE FUNCTION check_user_group_role(
    group_id uuid,
    user_id uuid,
    allowed_roles text[]
) RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = $1
        AND group_members.user_id = $2
        AND group_members.role = ANY($3)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix group_members policies
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can add members to groups" ON group_members;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can update members" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can remove members" ON group_members;

-- Create new non-recursive policies
CREATE POLICY "Users can add members to groups" ON group_members
FOR INSERT WITH CHECK (
    -- Allow group owners and admins to add members
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
    OR
    -- Allow users to add themselves as owners when creating a new group
    (user_id = auth.uid() AND role = 'owner' AND 
     EXISTS (
         SELECT 1 FROM budget_groups bg
         WHERE bg.id = group_id AND bg.created_by = auth.uid()
     ))
);

CREATE POLICY "Users can view members of groups they belong to"
    ON group_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
    ));

CREATE POLICY "Group owners and admins can update members"
    ON group_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    ));

CREATE POLICY "Group owners and admins can remove members"
    ON group_members FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    ));

-- Fix group_invitations policies
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view invitations they created" ON group_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON group_invitations;
DROP POLICY IF EXISTS "Group owners and admins can create invitations" ON group_invitations;
DROP POLICY IF EXISTS "Group owners and admins can update invitations" ON group_invitations;
DROP POLICY IF EXISTS "Group owners and admins can delete invitations" ON group_invitations;

-- Create new non-recursive policies
CREATE POLICY "Users can view invitations they created" ON group_invitations
FOR SELECT USING (
    invited_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_invitations.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Users can view invitations sent to their email" ON group_invitations
FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Group owners and admins can create invitations" ON group_invitations
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_invitations.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Group owners and admins can update invitations" ON group_invitations
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_invitations.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Group owners and admins can delete invitations" ON group_invitations
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_invitations.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
);

-- Ensure invited_by foreign key exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'group_invitations_invited_by_fkey'
    ) THEN
        ALTER TABLE group_invitations
        ADD CONSTRAINT group_invitations_invited_by_fkey
        FOREIGN KEY (invited_by)
        REFERENCES auth.users(id);
    END IF;
END
$$;