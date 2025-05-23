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

-- Enable RLS on bank_accounts table
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for bank_accounts
DROP POLICY IF EXISTS "Users can view their own bank accounts" ON bank_accounts;
CREATE POLICY "Users can view their own bank accounts"
    ON bank_accounts FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bank accounts" ON bank_accounts;
CREATE POLICY "Users can create their own bank accounts"
    ON bank_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bank accounts" ON bank_accounts;
CREATE POLICY "Users can update their own bank accounts"
    ON bank_accounts FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bank accounts" ON bank_accounts;
CREATE POLICY "Users can delete their own bank accounts"
    ON bank_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Add bank_account_id to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL;
