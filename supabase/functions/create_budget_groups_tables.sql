-- Function to create budget groups tables
CREATE OR REPLACE FUNCTION create_budget_groups_tables()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
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

    -- Create function to log group activity
    CREATE OR REPLACE FUNCTION log_group_activity()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    DECLARE
        action_type TEXT;
        details JSONB := '{}'::JSONB;
        group_id_val UUID;
        user_id_val UUID;
    BEGIN
        -- Determine the action type based on the operation
        IF TG_OP = 'INSERT' THEN
            action_type := 'created';
        ELSIF TG_OP = 'UPDATE' THEN
            action_type := 'updated';
        ELSIF TG_OP = 'DELETE' THEN
            action_type := 'deleted';
        END IF;
        
        -- Set group_id and user_id based on the table
        IF TG_TABLE_NAME = 'group_transactions' THEN
            IF TG_OP = 'DELETE' THEN
                group_id_val := OLD.group_id;
                user_id_val := OLD.created_by;
                details := jsonb_build_object('type', OLD.type, 'amount', OLD.amount, 'description', OLD.description);
                action_type := action_type || '_transaction';
            ELSE
                group_id_val := NEW.group_id;
                user_id_val := NEW.created_by;
                details := jsonb_build_object('type', NEW.type, 'amount', NEW.amount, 'description', NEW.description);
                action_type := action_type || '_transaction';
            END IF;
        ELSIF TG_TABLE_NAME = 'group_budgets' THEN
            IF TG_OP = 'DELETE' THEN
                group_id_val := OLD.group_id;
                user_id_val := OLD.created_by;
                details := jsonb_build_object('name', OLD.name, 'amount', OLD.amount);
                action_type := action_type || '_budget';
            ELSE
                group_id_val := NEW.group_id;
                user_id_val := NEW.created_by;
                details := jsonb_build_object('name', NEW.name, 'amount', NEW.amount);
                action_type := action_type || '_budget';
            END IF;
        ELSIF TG_TABLE_NAME = 'group_members' THEN
            IF TG_OP = 'DELETE' THEN
                group_id_val := OLD.group_id;
                user_id_val := OLD.user_id;
                details := jsonb_build_object('role', OLD.role);
                action_type := 'member_removed';
            ELSIF TG_OP = 'INSERT' THEN
                group_id_val := NEW.group_id;
                user_id_val := NEW.user_id;
                details := jsonb_build_object('role', NEW.role);
                action_type := 'member_added';
            ELSE
                group_id_val := NEW.group_id;
                user_id_val := NEW.user_id;
                details := jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role);
                action_type := 'member_role_changed';
            END IF;
        ELSE
            -- For other tables, skip logging
            RETURN NULL;
        END IF;
        
        -- Insert the activity log
        INSERT INTO group_activity_log (group_id, user_id, action, details)
        VALUES (group_id_val, user_id_val, action_type, details);
        
        -- Return the appropriate row based on the operation
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
    END;
    $$;

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

    -- Refresh the schema cache
    NOTIFY pgrst, 'reload schema';
END;
$$;
