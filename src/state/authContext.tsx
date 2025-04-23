import { createContext } from "react";
import { User, AuthError } from "@supabase/supabase-js";

// Define proper interfaces for user profile and settings based on actual API
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  currency: string;
  theme: string; // API returns string, we'll cast it to Theme when needed
  language: string;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userProfile?: UserProfile | null; // User profile data
  userSettings?: UserSettings | null; // User settings data
  refreshUserData?: () => Promise<void>; // Function to refresh user data
  login: (
    email: string,
    password: string
  ) => Promise<{
    error: AuthError | null;
  }>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{
    error: AuthError | null;
  }>;
  logout: () => Promise<{
    error: AuthError | null;
  }>;
  resetPassword: (email: string) => Promise<{
    error: AuthError | null;
  }>;
  updatePassword: (password: string) => Promise<{
    error: AuthError | null;
  }>;
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
