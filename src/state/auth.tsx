import { useEffect, useState, ReactNode } from "react";
import { AuthContext } from "./authContext";
import { User, AuthError } from "@supabase/supabase-js";
import * as authApi from "../api/supabase/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data } = await authApi.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data } = authApi.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Type assertion to handle the session object
        const authSession = session as unknown as { user: User };
        setUser(authSession.user || null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "USER_UPDATED" && session) {
        // Type assertion to handle the session object
        const authSession = session as unknown as { user: User };
        setUser(authSession.user || null);
      }
    });

    // Clean up subscription on unmount
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error, data } = await authApi.login(email, password);
      if (!error && data.user) {
        setUser(data.user);
      }
      return { error };
    } catch (error) {
      console.error("Login error:", error);
      return { error: error as AuthError };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ) => {
    try {
      const { error, data } = await authApi.register(email, password, fullName);
      if (!error && data.user) {
        setUser(data.user);
      }
      return { error };
    } catch (error) {
      console.error("Registration error:", error);
      return { error: error as AuthError };
    }
  };

  const logout = async () => {
    try {
      const { error } = await authApi.logout();
      if (!error) {
        setUser(null);
      }
      return { error };
    } catch (error) {
      console.error("Logout error:", error);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authApi.resetPassword(email);
      return { error };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await authApi.updatePassword(password);
      return { error };
    } catch (error) {
      console.error("Update password error:", error);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth hook moved to src/state/useAuth.ts
