import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getSession,
  getCurrentUser,
  onAuthStateChange,
  getUserProfile,
  getUserSettings
} from '../../api/supabase/auth';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  userSettings: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [userSettings, setUserSettings] = useState<any | null>(null);
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
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    // Set up auth state change listener
    const { data } = onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserData(session.user.id);
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
        getUserSettings(userId)
      ]);
      
      setUserProfile(profileResponse.data);
      setUserSettings(settingsResponse.data);
    } catch (error) {
      console.error('Error loading user data:', error);
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
      console.error('Login error:', error);
      return { error };
    }
  }

  // Register function
  async function register(email: string, password: string, fullName: string) {
    try {
      const { error } = await apiRegister(email, password, fullName);
      return { error };
    } catch (error) {
      console.error('Registration error:', error);
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
      console.error('Logout error:', error);
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
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
