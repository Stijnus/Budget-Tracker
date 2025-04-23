-- Fix the RLS policy for group_members to allow the group creator to add themselves as the first member

-- Drop the existing policy
DROP POLICY IF EXISTS "Group owners and admins can add members" ON group_members;

-- Create a new policy that allows:
-- 1. Group owners and admins to add members
-- 2. Users to add themselves as owners when creating a new group
CREATE POLICY "Users can add members to groups" ON group_members
FOR INSERT WITH CHECK (
  -- Allow group owners and admins to add members
  (group_id IN (
    SELECT group_id FROM group_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ))
  OR
  -- Allow users to add themselves as owners when creating a new group
  (user_id = auth.uid() AND role = 'owner' AND 
   EXISTS (
     SELECT 1 FROM budget_groups
     WHERE id = group_id AND created_by = auth.uid()
   ))
);

-- Keep the existing policies for other operations
-- These policies should already exist, but we'll recreate them to be sure

-- Users can view members of groups they belong to
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON group_members;
CREATE POLICY "Users can view members of groups they belong to"
    ON group_members FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

-- Group owners and admins can update members
DROP POLICY IF EXISTS "Group owners and admins can update members" ON group_members;
CREATE POLICY "Group owners and admins can update members"
    ON group_members FOR UPDATE
    USING (
        group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Group owners and admins can remove members
DROP POLICY IF EXISTS "Group owners and admins can remove members" ON group_members;
CREATE POLICY "Group owners and admins can remove members"
    ON group_members FOR DELETE
    USING (
        group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );
