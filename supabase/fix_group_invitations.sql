-- Fix the group_invitations table foreign key relationship with invited_by

-- First, add the foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'group_invitations_invited_by_fkey'
    ) THEN
        ALTER TABLE group_invitations
        ADD CONSTRAINT group_invitations_invited_by_fkey
        FOREIGN KEY (invited_by)
        REFERENCES auth.users(id);
    END IF;
END
$$;

-- Create a function to generate invitation tokens
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

-- Create or update policies for group_invitations
DROP POLICY IF EXISTS "Users can view invitations they created" ON group_invitations;
CREATE POLICY "Users can view invitations they created" ON group_invitations
FOR SELECT USING (
    invited_by = auth.uid() OR
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- Add policy for users to view invitations sent to their email
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON group_invitations;
CREATE POLICY "Users can view invitations sent to their email" ON group_invitations
FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Add policy for anyone to view invitations by token (needed for accepting invitations)
DROP POLICY IF EXISTS "Anyone can view invitations by token" ON group_invitations;
CREATE POLICY "Anyone can view invitations by token" ON group_invitations
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Group owners and admins can create invitations" ON group_invitations;
CREATE POLICY "Group owners and admins can create invitations" ON group_invitations
FOR INSERT WITH CHECK (
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

DROP POLICY IF EXISTS "Group owners and admins can update invitations" ON group_invitations;
CREATE POLICY "Group owners and admins can update invitations" ON group_invitations
FOR UPDATE USING (
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

DROP POLICY IF EXISTS "Group owners and admins can delete invitations" ON group_invitations;
CREATE POLICY "Group owners and admins can delete invitations" ON group_invitations
FOR DELETE USING (
    group_id IN (
        SELECT group_id FROM group_members
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);
