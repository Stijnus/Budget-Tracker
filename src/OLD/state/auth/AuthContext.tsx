import { createContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getSession,
  getCurrentUser,
  onAuthStateChange,
  getUserProfile,
  getUserSettings,
} from "../../api/supabase/auth";

// Define types for user profile and settings
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  id: string;
  currency: string;
  theme: string;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userSettings: UserSettings | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ error: unknown | null }>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: unknown | null }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    async function initializeAuth() {
      setIsLoading(true);
      try {
        // Get current session
        const { data } = await getSession();

        if (data.session) {
          const user = await getCurrentUser();
          if (user) {
            setUser(user);
            await loadUserData(user.id);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    // Set up auth state change listener
    const { data } = onAuthStateChange(async (_event, session) => {
      // Cast session to any to handle the type issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionObj = session as any;
      const currentUser = sessionObj?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadUserData(currentUser.id);
      } else {
        setUserProfile(null);
        setUserSettings(null);
      }
    });

    // Clean up subscription
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Load user profile and settings
  async function loadUserData(userId: string) {
    try {
      const [profileResponse, settingsResponse] = await Promise.all([
        getUserProfile(userId),
        getUserSettings(userId),
      ]);

      setUserProfile(profileResponse.data);
      setUserSettings(settingsResponse.data);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }

  // Refresh user data
  async function refreshUserData() {
    if (user) {
      await loadUserData(user.id);
    }
  }

  // Login function
  async function login(email: string, password: string) {
    try {
      const { error } = await apiLogin(email, password);
      return { error };
    } catch (error) {
      console.error("Login error:", error);
      return { error };
    }
  }

  // Register function
  async function register(email: string, password: string, fullName: string) {
    try {
      const { error } = await apiRegister(email, password, fullName);
      return { error };
    } catch (error) {
      console.error("Registration error:", error);
      return { error };
    }
  }

  // Logout function
  async function logout() {
    try {
      await apiLogout();
      setUser(null);
      setUserProfile(null);
      setUserSettings(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  // Context value
  const value = {
    user,
    userProfile,
    userSettings,
    isLoading,
    login,
    register,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export the AuthContext
export { AuthContext };
