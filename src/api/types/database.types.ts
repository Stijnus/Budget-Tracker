export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>; // Will be populated with actual tables later
    Views: {
      [_ in never]: never;
    };
    Functions: Record<string, never>; // Will be populated with actual functions later
    Enums: Record<string, never>; // Will be populated with actual enums later
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Example of how tables will be defined once created in Supabase:
/*
user_profiles: {
  Row: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    created_at: string | null;
  };
  Insert: {
    id: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    created_at?: string | null;
  };
  Update: {
    id?: string;
    email?: string;
    first_name?: string | null;
    last_name?: string | null;
    created_at?: string | null;
  };
};
*/
