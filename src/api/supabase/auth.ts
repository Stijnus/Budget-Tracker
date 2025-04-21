import { supabase } from './client';
import type { AuthError, AuthResponse } from '@supabase/supabase-js';

/**
 * Register a new user with email and password
 */
export async function register(email: string, password: string, fullName: string): Promise<AuthResponse> {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Logout the current user
 */
export async function logout(): Promise<{ error: AuthError | null }> {
  return supabase.auth.signOut();
}

/**
 * Get the current user session
 */
export async function getSession() {
  return supabase.auth.getSession();
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Send a password reset email
 */
export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

/**
 * Update user password
 */
export async function updatePassword(password: string) {
  return supabase.auth.updateUser({
    password,
  });
}

/**
 * Update user email
 */
export async function updateEmail(email: string) {
  return supabase.auth.updateUser({
    email,
  });
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(metadata: { [key: string]: any }) {
  return supabase.auth.updateUser({
    data: metadata,
  });
}

/**
 * Set up auth state change listener
 */
export function onAuthStateChange(callback: (event: any, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, profile: { full_name?: string; avatar_url?: string }) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
}

/**
 * Get user settings
 */
export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
}

/**
 * Update user settings
 */
export async function updateUserSettings(userId: string, settings: { currency?: string; theme?: string; notification_enabled?: boolean }) {
  const { data, error } = await supabase
    .from('user_settings')
    .update(settings)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
}
