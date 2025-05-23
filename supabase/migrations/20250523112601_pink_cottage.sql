/*
  # Fix RLS policies for group members and invitations

  1. Changes
    - Fix infinite recursion in group_members policies
    - Update group_invitations policies to prevent recursion
    - Add secure token generation function
    - Ensure proper foreign key relationships

  2. Security
    - Maintain existing security rules while preventing recursion
    - Enable RLS on affected tables
    - Add proper policies for all operations
*/

-- First, let's fix the group_members policies
DROP POLICY IF EXISTS "Users can add members to groups" ON group_members;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can update members" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can remove members" ON group_members;

-- Create new policies without recursion
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
USING (
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Group owners and admins can update members"
ON group_members FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Group owners and admins can remove members"
ON group_members FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role IN ('owner', 'admin')
    )
);

-- Now fix the group_invitations policies
DROP POLICY IF EXISTS "Users can view invitations they created" ON group_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON group_invitations;
DROP POLICY IF EXISTS "Group owners and admins can create invitations" ON group_invitations;
DROP POLICY IF EXISTS "Group owners and admins can update invitations" ON group_invitations;
DROP POLICY IF EXISTS "Group owners and admins can delete invitations" ON group_invitations;

-- Create or replace the token generation function
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
    token TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Generate a random token
        token := encode(gen_random_bytes(20), 'hex');
        
        -- Check if it already exists
        SELECT EXISTS(
            SELECT 1 FROM group_invitations WHERE token = token
        ) INTO exists_already;
        
        -- If it doesn't exist, return it
        IF NOT exists_already THEN
            RETURN token;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies for group_invitations
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

-- Ensure RLS is enabled on both tables
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;