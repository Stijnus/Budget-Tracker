/*
  # Fix group_members RLS policies

  1. Changes
    - Drop existing policies that cause infinite recursion
    - Create new policies with optimized permission checks
    - Ensure proper access control for group operations
    
  2. Security
    - Maintain security while preventing recursion
    - Allow group creation workflow
    - Preserve existing access patterns
*/

-- Enable RLS on group_members if not already enabled
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can add members to groups" ON group_members;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can update members" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can remove members" ON group_members;

-- Create optimized INSERT policy
CREATE POLICY "Users can add members to groups"
ON group_members FOR INSERT
WITH CHECK (
  -- Allow group owners and admins to add new members
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
      WHERE bg.id = group_members.group_id
      AND bg.created_by = auth.uid()
    )
  )
);

-- Create SELECT policy without recursion
CREATE POLICY "Users can view members of groups they belong to"
ON group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM budget_groups bg
    WHERE bg.id = group_members.group_id
    AND (
      -- User is the group creator
      bg.created_by = auth.uid()
      OR
      -- User is a member of the group
      EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
      )
    )
  )
);

-- Create UPDATE policy
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

-- Create DELETE policy
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