/*
  # Fix group members RLS policy

  1. Changes
    - Add helper function `check_user_group_role` to safely check member roles
    - Fix group members policies to prevent recursion
    - Update group invitations policy to use the helper function
  
  2. Security
    - Maintains proper access control while avoiding infinite recursion
    - Ensures group owners and admins can manage members
    - Allows users to add themselves as owners when creating groups
*/

-- Create helper function to check user roles without recursion
CREATE OR REPLACE FUNCTION check_user_group_role(group_id uuid, user_id uuid, allowed_roles text[])
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = $1 
        AND gm.user_id = $2 
        AND gm.role = ANY($3)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Group owners and admins can add members" ON group_members;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can update members" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can add members to groups" ON group_members;

-- Create new policies using the helper function
CREATE POLICY "Users can add members to groups"
ON group_members FOR INSERT
WITH CHECK (
    -- Allow group owners and admins to add members
    check_user_group_role(group_id, auth.uid(), ARRAY['owner', 'admin'])
    OR 
    -- Allow users to add themselves as owners when creating a new group
    (user_id = auth.uid() AND role = 'owner' AND EXISTS (
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
    check_user_group_role(group_id, auth.uid(), ARRAY['owner', 'admin'])
);

CREATE POLICY "Group owners and admins can remove members"
ON group_members FOR DELETE
USING (
    check_user_group_role(group_id, auth.uid(), ARRAY['owner', 'admin'])
);

-- Update group invitations policy to use the helper function
DROP POLICY IF EXISTS "Users can view invitations they created" ON group_invitations;

CREATE POLICY "Users can view invitations they created"
ON group_invitations FOR SELECT
USING (
    invited_by = auth.uid()
    OR check_user_group_role(group_id, auth.uid(), ARRAY['owner', 'admin'])
);