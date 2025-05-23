import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) throw new Error('Missing environment variable: VITE_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');

// Create Supabase client with enhanced session handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    autoRefreshToken: true, // Enable automatic token refresh
    storageKey: 'supabase.auth.token', // Specify storage key
    storage: window.localStorage, // Use localStorage for token storage
    detectSessionInUrl: true, // Detect session in URL on OAuth login
  },
});

// Export types for convenience
export type SupabaseClient = typeof supabase;