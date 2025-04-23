-- Fix budget_groups tables and relationships

-- Budget Groups table
CREATE TABLE IF NOT EXISTS budget_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Members table
CREATE TABLE IF NOT EXISTS group_members (
    group_id UUID REFERENCES budget_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- Group Invitations table
CREATE TABLE IF NOT EXISTS group_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES budget_groups(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    token TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared Categories table
CREATE TABLE IF NOT EXISTS shared_categories (
    group_id UUID REFERENCES budget_groups(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, category_id)
);

-- Shared Budgets table
CREATE TABLE IF NOT EXISTS shared_budgets (
    group_id UUID REFERENCES budget_groups(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, budget_id)
);

-- Group Budgets table
CREATE TABLE IF NOT EXISTS group_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES budget_groups(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Transactions table
CREATE TABLE IF NOT EXISTS group_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES budget_groups(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    payment_method TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Activity Log table
CREATE TABLE IF NOT EXISTS group_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES budget_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE budget_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for budget_groups
CREATE POLICY IF NOT EXISTS "Users can view groups they are members of"
    ON budget_groups FOR SELECT
    USING (
        id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Users can create budget groups"
    ON budget_groups FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Group owners and admins can update their groups"
    ON budget_groups FOR UPDATE
    USING (
        id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY IF NOT EXISTS "Group owners can delete their groups"
    ON budget_groups FOR DELETE
    USING (
        id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Create policies for group_members
CREATE POLICY IF NOT EXISTS "Users can view members of groups they belong to"
    ON group_members FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Group owners and admins can add members"
    ON group_members FOR INSERT
    WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
        OR
        (user_id = auth.uid())  -- Allow users to add themselves (for accepting invitations)
    );

CREATE POLICY IF NOT EXISTS "Group owners and admins can update members"
    ON group_members FOR UPDATE
    USING (
        group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY IF NOT EXISTS "Group owners and admins can remove members"
    ON group_members FOR DELETE
    USING (
        group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
        OR
        (user_id = auth.uid())  -- Allow users to remove themselves
    );

-- Create policies for group_invitations
CREATE POLICY IF NOT EXISTS "Users can view invitations for groups they belong to"
    ON group_invitations FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
        OR
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY IF NOT EXISTS "Group owners and admins can create invitations"
    ON group_invitations FOR INSERT
    WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
        AND invited_by = auth.uid()
    );

CREATE POLICY IF NOT EXISTS "Group owners and admins can update invitations"
    ON group_invitations FOR UPDATE
    USING (
        group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
        OR
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY IF NOT EXISTS "Group owners and admins can delete invitations"
    ON group_invitations FOR DELETE
    USING (
        group_id IN (
            SELECT group_id FROM group_members
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Create function to generate invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    token TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Generate a random token (32 characters)
        token := encode(gen_random_bytes(16), 'hex');
        
        -- Check if this token already exists
        SELECT EXISTS(SELECT 1 FROM group_invitations WHERE token = token) INTO exists_already;
        
        -- If token doesn't exist, return it
        IF NOT exists_already THEN
            RETURN token;
        END IF;
    END LOOP;
END;
$$;

-- Refresh the schema cache to ensure all relationships are recognized
NOTIFY pgrst, 'reload schema';
