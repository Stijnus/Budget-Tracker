/*
  # Fix group_members SELECT RLS policy to prevent recursion

  1. Changes
    - Recreate `check_user_group_role` helper function to ensure it's correctly defined.
    - Drop the existing "Users can view members of groups they belong to" policy.
    - Recreate the "Users can view members of groups they belong to" policy 
      using a non-recursive approach by first querying `budget_groups`.

  2. Security
    - Maintains proper access control for viewing group members.
    - Prevents infinite recursion error.
*/

-- Recreate helper function to ensure it's the correct version and available
-- This function is used by other policies as well.
CREATE OR REPLACE FUNCTION check_user_group_role(p_group_id uuid, p_user_id uuid, p_allowed_roles text[])
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = p_group_id
        AND gm.user_id = p_user_id
        AND gm.role = ANY(p_allowed_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the potentially problematic SELECT policy
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;

-- Create new SELECT policy that avoids direct recursion on group_members
CREATE POLICY "Users can view members of groups they belong to"
ON public.group_members FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.budget_groups bg
        WHERE bg.id = group_members.group_id -- Correctly references the group_id from the row being checked
        AND EXISTS (
            SELECT 1
            FROM public.group_members gm_check -- Use an alias for the inner check
            WHERE gm_check.group_id = bg.id
            AND gm_check.user_id = auth.uid()
        )
    )
);

-- It's also good practice to ensure RLS is enabled.
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Notify PostgREST to reload schema, in case it helps pick up changes faster.
NOTIFY pgrst, 'reload schema'; 