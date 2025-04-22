import { createContext } from "react";
import { User, AuthError } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userProfile?: any; // User profile data
  userSettings?: any; // User settings data
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
