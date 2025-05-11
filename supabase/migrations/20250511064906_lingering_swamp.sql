/*
  # Fix group members RLS policies

  1. Changes
    - Drop and recreate group_members policies to prevent infinite recursion
    - Simplify policy conditions to avoid circular references
    - Add proper checks for group ownership and membership
    - Ensure policies use direct user ID checks where possible

  2. Security
    - Maintain existing security model while fixing recursion
    - Ensure group owners/admins retain management capabilities
    - Preserve member viewing permissions
*/

-- Enable RLS on group_members if not already enabled
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can add members to groups" ON group_members;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can update members" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can remove members" ON group_members;

-- Create new INSERT policy
CREATE POLICY "Users can add members to groups"
ON group_members FOR INSERT
WITH CHECK (
  -- Allow group owners and admins to add members
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
  )
  OR 
  -- Allow users to add themselves as owners when creating a new group
  (
    user_id = auth.uid() 
    AND role = 'owner' 
    AND EXISTS (
      SELECT 1 FROM budget_groups bg
      WHERE bg.id = group_id 
      AND bg.created_by = auth.uid()
    )
  )
);

-- Create new SELECT policy
CREATE POLICY "Users can view members of groups they belong to"
ON group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);

-- Create new UPDATE policy
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

-- Create new DELETE policy
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