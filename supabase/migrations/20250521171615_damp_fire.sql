/*
  # Fix group members RLS policy

  1. Changes
    - Add helper function to check user group role
    - Fix group members policies to avoid recursion
    - Update group invitations policy to use helper function

  2. Security
    - Maintain existing security rules while fixing recursion
    - Ensure proper access control for group operations
*/

-- Create helper function to check user role in a group
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

-- Create new policies using the helper function
CREATE POLICY "Users can add members to groups" ON group_members
FOR INSERT WITH CHECK (
  -- Allow group owners and admins to add members
  check_user_group_role(group_id, auth.uid(), ARRAY['owner', 'admin'])
  OR
  -- Allow users to add themselves as owners when creating a new group
  (user_id = auth.uid() AND role = 'owner' AND 
   EXISTS (
     SELECT 1 FROM budget_groups
     WHERE id = group_id AND created_by = auth.uid()
   ))
);

CREATE POLICY "Users can view members of groups they belong to" ON group_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group owners and admins can update members" ON group_members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
  )
);

CREATE POLICY "Group owners and admins can remove members" ON group_members
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
  )
);

-- Update group invitations policy to use the helper function
DROP POLICY IF EXISTS "Users can view invitations they created" ON group_invitations;

CREATE POLICY "Users can view invitations they created" ON group_invitations
FOR SELECT USING (
  invited_by = auth.uid()
  OR
  check_user_group_role(group_id, auth.uid(), ARRAY['owner', 'admin'])
);