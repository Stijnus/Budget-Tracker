import { useEffect, useState, ReactNode, useCallback } from "react";
import { AuthContext, UserProfile, UserSettings } from "./authContext";
import { User, AuthError } from "@supabase/supabase-js";
import * as authApi from "../api/supabase/auth";
import { useTheme } from "../providers/themeUtils";
import type { Theme } from "../providers/themeUtils";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setTheme } = useTheme();

  // Function to fetch user profile and settings
  const fetchUserData = useCallback(
    async (userId: string) => {
      try {
        // Fetch user profile
        const { data: profileData } = await authApi.getUserProfile(userId);
        setUserProfile(profileData);

        // Fetch user settings
        const { data: settingsData } = await authApi.getUserSettings(userId);
        setUserSettings(settingsData);

        // Apply theme if available
        if (settingsData?.theme) {
          setTheme(settingsData.theme as Theme);
        }

        // Store user settings in localStorage for formatters to use
        if (settingsData) {
          localStorage.setItem("userSettings", JSON.stringify(settingsData));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    [setTheme]
  );

  // Function to refresh user data
  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data } = await authApi.getSession();
        const currentUser = data.session?.user || null;
        setUser(currentUser);

        // If user exists, fetch their data
        if (currentUser) {
          await fetchUserData(currentUser.id);
        }
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
        const newUser = authSession.user || null;
        setUser(newUser);

        // Fetch user data when signed in
        if (newUser) {
          fetchUserData(newUser.id);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
        setUserSettings(null);
        // Reset theme to default
        setTheme("light" as Theme);
        // Clear user settings from localStorage
        localStorage.removeItem("userSettings");
      } else if (event === "USER_UPDATED" && session) {
        // Type assertion to handle the session object
        const authSession = session as unknown as { user: User };
        const updatedUser = authSession.user || null;
        setUser(updatedUser);

        // Refresh user data when updated
        if (updatedUser) {
          fetchUserData(updatedUser.id);
        }
      }
    });

    // Clean up subscription on unmount
    return () => {
      data.subscription.unsubscribe();
    };
  }, [fetchUserData, setTheme]);

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
    userProfile,
    userSettings,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth hook moved to src/state/useAuth.ts
