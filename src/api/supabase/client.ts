import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) throw new Error('Missing environment variable: VITE_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Export types for convenience
export type SupabaseClient = typeof supabase;
