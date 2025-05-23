-- Fix relationships between transactions and bank_accounts tables

-- First, check if the bank_account_id column exists in the transactions table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'transactions'
        AND column_name = 'bank_account_id'
    ) THEN
        -- Add the bank_account_id column if it doesn't exist
        ALTER TABLE transactions ADD COLUMN bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Refresh the schema cache to ensure the relationship is recognized
NOTIFY pgrst, 'reload schema';
