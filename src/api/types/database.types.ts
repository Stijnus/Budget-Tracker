export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      // Define your tables here once you create them in Supabase
      // Example:
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // Define your functions here once you create them in Supabase
    };
    Enums: {
      // Define your enums here once you create them in Supabase
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
