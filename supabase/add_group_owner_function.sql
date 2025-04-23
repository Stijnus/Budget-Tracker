-- Create a function to add a group owner that bypasses RLS
CREATE OR REPLACE FUNCTION add_group_owner(p_group_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if the user is the creator of the group
  IF EXISTS (
    SELECT 1 FROM budget_groups 
    WHERE id = p_group_id AND created_by = p_user_id
  ) THEN
    -- Insert the user as the owner
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (p_group_id, p_user_id, 'owner');
  ELSE
    RAISE EXCEPTION 'User is not the creator of this group';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
