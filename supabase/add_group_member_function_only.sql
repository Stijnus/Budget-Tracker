-- Create a function to add a member to a group with elevated permissions
-- This function will be called from the Edge Function and bypasses RLS

CREATE OR REPLACE FUNCTION add_group_member(
  p_group_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'member'
) RETURNS VOID AS $$
BEGIN
  -- Insert the new member
  INSERT INTO group_members (group_id, user_id, role, joined_at)
  VALUES (p_group_id, p_user_id, p_role, NOW())
  ON CONFLICT (group_id, user_id) DO NOTHING;
  
  -- Log the activity
  INSERT INTO group_activity (group_id, user_id, action, description, created_at)
  VALUES (
    p_group_id,
    p_user_id,
    'join',
    'User joined the group via invitation',
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
