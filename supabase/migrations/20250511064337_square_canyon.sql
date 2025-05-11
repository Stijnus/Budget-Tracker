/*
  # Fix infinite recursion in group_members policies

  1. Changes
    - Remove recursive policy definitions that cause infinite loops
    - Implement new policies that avoid self-referential checks
    - Add security definer function for role checking
    
  2. Security
    - Maintain existing access control rules
    - Use more efficient permission checks
    - Preserve data integrity
*/

-- Create a function to check user's group role
CREATE OR REPLACE FUNCTION check_user_group_role(group_id UUID, user_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM group_members gm
        WHERE gm.group_id = $1
        AND gm.user_id = $2
        AND gm.role = ANY($3)
    );
END;
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can add members" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can update members" ON group_members;
DROP POLICY IF EXISTS "Group owners and admins can remove members" ON group_members;

-- Create new policies without recursion
CREATE POLICY "Users can view members of groups they belong to"
ON group_members FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM budget_groups bg
        WHERE bg.id = group_id
        AND EXISTS (
            SELECT 1
            FROM group_members gm2
            WHERE gm2.group_id = bg.id
            AND gm2.user_id = auth.uid()
        )
    )
);

CREATE POLICY "Group owners and admins can add members"
ON group_members FOR INSERT
WITH CHECK (
    check_user_group_role(group_id, auth.uid(), ARRAY['owner', 'admin'])
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

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';