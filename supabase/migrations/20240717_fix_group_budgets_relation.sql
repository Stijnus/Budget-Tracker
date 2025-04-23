-- Fix the relationship between group_budgets and created_by column

-- Ensure the created_by column is properly defined with a foreign key reference
ALTER TABLE group_budgets DROP CONSTRAINT IF EXISTS group_budgets_created_by_fkey;
ALTER TABLE group_budgets ADD CONSTRAINT group_budgets_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Refresh the schema cache to ensure the relationship is recognized by PostgREST
NOTIFY pgrst, 'reload schema';
