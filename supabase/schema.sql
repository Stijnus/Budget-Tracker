-- Complete schema for Budget Tracker application
-- This will be applied directly to the remote Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS group_activity_log CASCADE;
DROP TABLE IF EXISTS group_budgets CASCADE;
DROP TABLE IF EXISTS group_transactions CASCADE;
DROP TABLE IF EXISTS shared_budgets CASCADE;
DROP TABLE IF EXISTS shared_categories CASCADE;
DROP TABLE IF EXISTS group_invitations CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS budget_groups CASCADE;
DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TABLE IF EXISTS bills_subscriptions CASCADE;
DROP TABLE IF EXISTS transaction_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'USD',
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    notification_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'both')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, name)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
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

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, name)
);

-- Transaction Tags junction table
CREATE TABLE IF NOT EXISTS transaction_tags (
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (transaction_id, tag_id)
);

-- Bills & Subscriptions table
CREATE TABLE IF NOT EXISTS bills_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE,
    frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'daily', 'weekly', 'monthly', 'yearly')),
    auto_pay BOOLEAN DEFAULT FALSE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    payment_method TEXT,
    reminder_days INTEGER DEFAULT 3,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bank Accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit', 'investment', 'other')),
    institution TEXT,
    account_number TEXT,
    current_balance DECIMAL(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    is_default BOOLEAN DEFAULT FALSE,
    notes TEXT,
    color TEXT,
    icon TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Goals table
CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    target_date DATE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'achieved', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for categories
CREATE POLICY "Users can view their own categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON categories FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for budgets
CREATE POLICY "Users can view their own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets"
    ON budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
    ON budgets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
    ON budgets FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for tags
CREATE POLICY "Users can view their own tags"
    ON tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
    ON tags FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for transaction_tags
CREATE POLICY "Users can view their own transaction tags"
    ON transaction_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM transactions
            WHERE transactions.id = transaction_tags.transaction_id
            AND transactions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own transaction tags"
    ON transaction_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM transactions
            WHERE transactions.id = transaction_tags.transaction_id
            AND transactions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own transaction tags"
    ON transaction_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM transactions
            WHERE transactions.id = transaction_tags.transaction_id
            AND transactions.user_id = auth.uid()
        )
    );

-- Create policies for bills_subscriptions
CREATE POLICY "Users can view their own bills and subscriptions"
    ON bills_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bills and subscriptions"
    ON bills_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills and subscriptions"
    ON bills_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills and subscriptions"
    ON bills_subscriptions FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for financial_goals
CREATE POLICY "Users can view their own financial goals"
    ON financial_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial goals"
    ON financial_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial goals"
    ON financial_goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial goals"
    ON financial_goals FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for bank_accounts
CREATE POLICY "Users can view their own bank accounts"
    ON bank_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank accounts"
    ON bank_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts"
    ON bank_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts"
    ON bank_accounts FOR DELETE
    USING (auth.uid() = user_id);

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

-- Create trigger to create user profile and settings on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into user_profiles
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

    -- Insert into user_settings with defaults
    INSERT INTO public.user_settings (id)
    VALUES (NEW.id);

    -- Create default categories for the new user
    INSERT INTO public.categories (user_id, name, color, type, is_default)
    VALUES
        (NEW.id, 'Food & Dining', '#FF5733', 'expense', TRUE),
        (NEW.id, 'Transportation', '#33A8FF', 'expense', TRUE),
        (NEW.id, 'Housing', '#33FF57', 'expense', TRUE),
        (NEW.id, 'Entertainment', '#A833FF', 'expense', TRUE),
        (NEW.id, 'Shopping', '#FF33A8', 'expense', TRUE),
        (NEW.id, 'Utilities', '#FFBD33', 'expense', TRUE),
        (NEW.id, 'Healthcare', '#33FFF6', 'expense', TRUE),
        (NEW.id, 'Personal Care', '#FF3352', 'expense', TRUE),
        (NEW.id, 'Education', '#3352FF', 'expense', TRUE),
        (NEW.id, 'Gifts & Donations', '#52FF33', 'expense', TRUE),
        (NEW.id, 'Salary', '#33FF8D', 'income', TRUE),
        (NEW.id, 'Freelance', '#8D33FF', 'income', TRUE),
        (NEW.id, 'Investments', '#FF8D33', 'income', TRUE),
        (NEW.id, 'Gifts Received', '#33FFBD', 'income', TRUE),
        (NEW.id, 'Other Income', '#BD33FF', 'income', TRUE);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
