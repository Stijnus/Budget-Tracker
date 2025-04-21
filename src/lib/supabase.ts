import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Authentication and database features will not work.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Export types for convenience
export type User = NonNullable<
  Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]
>;

export type Session = NonNullable<
  Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
>;
