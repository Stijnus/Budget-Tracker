-- Add tables for collaborative budget management

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
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared Categories table
CREATE TABLE IF NOT EXISTS shared_categories (
    group_id UUID REFERENCES budget_groups(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, category_id)
);

-- Shared Budgets table
CREATE TABLE IF NOT EXISTS shared_budgets (
    group_id UUID REFERENCES budget_groups(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, budget_id)
);

-- Group Transactions table (for transactions that belong to a group)
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

-- Group Budgets table (for budgets that belong to a group)
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

-- Group Activity Log table (for tracking activity within a group)
CREATE TABLE IF NOT EXISTS group_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES budget_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE budget_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for budget_groups
CREATE POLICY "Users can view groups they are members of"
    ON budget_groups FOR SELECT
    USING (
        id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create budget groups"
    ON budget_groups FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group owners and admins can update their groups"
    ON budget_groups FOR UPDATE
    USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Group owners can delete their groups"
    ON budget_groups FOR DELETE
    USING (
        id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Create policies for group_members
CREATE POLICY "Users can view members of groups they belong to"
    ON group_members FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group owners and admins can add members"
    ON group_members FOR INSERT
    WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Group owners and admins can update members"
    ON group_members FOR UPDATE
    USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Group owners and admins can remove members"
    ON group_members FOR DELETE
    USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Create policies for group_invitations
CREATE POLICY "Users can view invitations they created"
    ON group_invitations FOR SELECT
    USING (
        invited_by = auth.uid() OR 
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Group owners and admins can create invitations"
    ON group_invitations FOR INSERT
    WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Group owners and admins can update invitations"
    ON group_invitations FOR UPDATE
    USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Group owners and admins can delete invitations"
    ON group_invitations FOR DELETE
    USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Create policies for shared_categories
CREATE POLICY "Users can view shared categories in their groups"
    ON shared_categories FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group owners and admins can share categories"
    ON shared_categories FOR INSERT
    WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Group owners and admins can unshare categories"
    ON shared_categories FOR DELETE
    USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Create policies for shared_budgets
CREATE POLICY "Users can view shared budgets in their groups"
    ON shared_budgets FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group owners and admins can share budgets"
    ON shared_budgets FOR INSERT
    WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Group owners and admins can unshare budgets"
    ON shared_budgets FOR DELETE
    USING (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Create policies for group_transactions
CREATE POLICY "Users can view transactions in their groups"
    ON group_transactions FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create transactions"
    ON group_transactions FOR INSERT
    WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Transaction creators and group admins can update transactions"
    ON group_transactions FOR UPDATE
    USING (
        (created_by = auth.uid()) OR
        (group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        ))
    );

CREATE POLICY "Transaction creators and group admins can delete transactions"
    ON group_transactions FOR DELETE
    USING (
        (created_by = auth.uid()) OR
        (group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        ))
    );

-- Create policies for group_budgets
CREATE POLICY "Users can view budgets in their groups"
    ON group_budgets FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can create budgets"
    ON group_budgets FOR INSERT
    WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
    );

CREATE POLICY "Budget creators and group admins can update budgets"
    ON group_budgets FOR UPDATE
    USING (
        (created_by = auth.uid()) OR
        (group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        ))
    );

CREATE POLICY "Budget creators and group admins can delete budgets"
    ON group_budgets FOR DELETE
    USING (
        (created_by = auth.uid()) OR
        (group_id IN (
            SELECT group_id FROM group_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        ))
    );

-- Create policies for group_activity_log
CREATE POLICY "Users can view activity logs for their groups"
    ON group_activity_log FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert activity logs"
    ON group_activity_log FOR INSERT
    WITH CHECK (true);

-- Create function to log group activity
CREATE OR REPLACE FUNCTION log_group_activity()
RETURNS TRIGGER AS $$
DECLARE
    action_type TEXT;
    entity_table TEXT;
    entity_id UUID;
    details_json JSONB;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'updated';
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'deleted';
    END IF;
    
    -- Set entity table and ID based on the table being modified
    entity_table := TG_TABLE_NAME;
    
    IF TG_TABLE_NAME = 'group_transactions' THEN
        IF TG_OP = 'DELETE' THEN
            entity_id := OLD.id;
            details_json := jsonb_build_object(
                'description', OLD.description,
                'amount', OLD.amount,
                'type', OLD.type
            );
        ELSE
            entity_id := NEW.id;
            details_json := jsonb_build_object(
                'description', NEW.description,
                'amount', NEW.amount,
                'type', NEW.type
            );
        END IF;
        
        -- Insert into activity log
        IF TG_OP = 'DELETE' THEN
            INSERT INTO group_activity_log (
                group_id, user_id, action, entity_type, entity_id, details
            ) VALUES (
                OLD.group_id, auth.uid(), action_type, 'transaction', entity_id, details_json
            );
        ELSE
            INSERT INTO group_activity_log (
                group_id, user_id, action, entity_type, entity_id, details
            ) VALUES (
                NEW.group_id, auth.uid(), action_type, 'transaction', entity_id, details_json
            );
        END IF;
    ELSIF TG_TABLE_NAME = 'group_budgets' THEN
        IF TG_OP = 'DELETE' THEN
            entity_id := OLD.id;
            details_json := jsonb_build_object(
                'name', OLD.name,
                'amount', OLD.amount
            );
        ELSE
            entity_id := NEW.id;
            details_json := jsonb_build_object(
                'name', NEW.name,
                'amount', NEW.amount
            );
        END IF;
        
        -- Insert into activity log
        IF TG_OP = 'DELETE' THEN
            INSERT INTO group_activity_log (
                group_id, user_id, action, entity_type, entity_id, details
            ) VALUES (
                OLD.group_id, auth.uid(), action_type, 'budget', entity_id, details_json
            );
        ELSE
            INSERT INTO group_activity_log (
                group_id, user_id, action, entity_type, entity_id, details
            ) VALUES (
                NEW.group_id, auth.uid(), action_type, 'budget', entity_id, details_json
            );
        END IF;
    ELSIF TG_TABLE_NAME = 'group_members' THEN
        IF TG_OP = 'DELETE' THEN
            entity_id := NULL;
            details_json := jsonb_build_object(
                'user_id', OLD.user_id,
                'role', OLD.role
            );
            
            -- Insert into activity log
            INSERT INTO group_activity_log (
                group_id, user_id, action, entity_type, entity_id, details
            ) VALUES (
                OLD.group_id, auth.uid(), 'removed_member', 'member', NULL, details_json
            );
        ELSE
            entity_id := NULL;
            details_json := jsonb_build_object(
                'user_id', NEW.user_id,
                'role', NEW.role
            );
            
            -- Insert into activity log
            IF TG_OP = 'INSERT' THEN
                INSERT INTO group_activity_log (
                    group_id, user_id, action, entity_type, entity_id, details
                ) VALUES (
                    NEW.group_id, auth.uid(), 'added_member', 'member', NULL, details_json
                );
            ELSE
                INSERT INTO group_activity_log (
                    group_id, user_id, action, entity_type, entity_id, details
                ) VALUES (
                    NEW.group_id, auth.uid(), 'updated_member', 'member', NULL, details_json
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for activity logging
CREATE TRIGGER log_group_transaction_activity
AFTER INSERT OR UPDATE OR DELETE ON group_transactions
FOR EACH ROW EXECUTE FUNCTION log_group_activity();

CREATE TRIGGER log_group_budget_activity
AFTER INSERT OR UPDATE OR DELETE ON group_budgets
FOR EACH ROW EXECUTE FUNCTION log_group_activity();

CREATE TRIGGER log_group_member_activity
AFTER INSERT OR UPDATE OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION log_group_activity();

-- Create function to generate invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
    token TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        -- Generate a random token
        token := encode(gen_random_bytes(24), 'hex');
        
        -- Check if token already exists
        SELECT EXISTS(
            SELECT 1 FROM group_invitations WHERE token = token
        ) INTO exists_already;
        
        -- Exit loop if token is unique
        EXIT WHEN NOT exists_already;
    END LOOP;
    
    RETURN token;
END;
$$ LANGUAGE plpgsql;
