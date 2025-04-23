-- Add foreign key relationship for created_by column in group_transactions table
ALTER TABLE public.group_transactions 
ADD CONSTRAINT group_transactions_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
