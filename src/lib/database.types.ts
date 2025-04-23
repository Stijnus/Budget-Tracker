export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      goal_contributions: {
        Row: {
          id: string;
          goal_id: string;
          amount: number;
          contribution_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          amount: number;
          contribution_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          amount?: number;
          contribution_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "financial_goals";
            referencedColumns: ["id"];
          }
        ];
      };
      bill_payments: {
        Row: {
          id: string;
          bill_id: string;
          amount: number;
          payment_date: string;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bill_id: string;
          amount: number;
          payment_date: string;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          bill_id?: string;
          amount?: number;
          payment_date?: string;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bill_payments_bill_id_fkey";
            columns: ["bill_id"];
            isOneToOne: false;
            referencedRelation: "bills_subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_settings: {
        Row: {
          id: string;
          currency: string;
          theme: string;
          language: string;
          notification_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          currency?: string;
          theme?: string;
          language?: string;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          currency?: string;
          theme?: string;
          language?: string;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string | null;
          type: "expense" | "income" | "both";
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          icon?: string | null;
          type: "expense" | "income" | "both";
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon?: string | null;
          type?: "expense" | "income" | "both";
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          bank_account_id: string | null;
          amount: number;
          description: string | null;
          date: string;
          type: "expense" | "income";
          payment_method: string | null;
          status: "pending" | "completed" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          bank_account_id?: string | null;
          amount: number;
          description?: string | null;
          date: string;
          type: "expense" | "income";
          payment_method?: string | null;
          status?: "pending" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          bank_account_id?: string | null;
          amount?: number;
          description?: string | null;
          date?: string;
          type?: "expense" | "income";
          payment_method?: string | null;
          status?: "pending" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_bank_account_id_fkey";
            columns: ["bank_account_id"];
            isOneToOne: false;
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          }
        ];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          name: string;
          amount: number;
          period: "daily" | "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          name: string;
          amount: number;
          period: "daily" | "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          name?: string;
          amount?: number;
          period?: "daily" | "weekly" | "monthly" | "yearly";
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "budgets_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      transaction_tags: {
        Row: {
          transaction_id: string;
          tag_id: string;
        };
        Insert: {
          transaction_id: string;
          tag_id: string;
        };
        Update: {
          transaction_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_tags_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          }
        ];
      };
      bills_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          due_date: string | null;
          frequency: "one-time" | "daily" | "weekly" | "monthly" | "yearly";
          auto_pay: boolean;
          category_id: string | null;
          payment_method: string | null;
          reminder_days: number;
          notes: string | null;
          status: "active" | "paused" | "cancelled";
          next_due_date: string | null;
          last_paid_date: string | null;
          payment_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          amount: number;
          due_date?: string | null;
          frequency: "one-time" | "daily" | "weekly" | "monthly" | "yearly";
          auto_pay?: boolean;
          category_id?: string | null;
          payment_method?: string | null;
          reminder_days?: number;
          notes?: string | null;
          status?: "active" | "paused" | "cancelled";
          next_due_date?: string | null;
          last_paid_date?: string | null;
          payment_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          amount?: number;
          due_date?: string | null;
          frequency?: "one-time" | "daily" | "weekly" | "monthly" | "yearly";
          auto_pay?: boolean;
          category_id?: string | null;
          payment_method?: string | null;
          reminder_days?: number;
          notes?: string | null;
          status?: "active" | "paused" | "cancelled";
          next_due_date?: string | null;
          last_paid_date?: string | null;
          payment_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bills_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bills_subscriptions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      bank_accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          account_type:
            | "checking"
            | "savings"
            | "credit"
            | "investment"
            | "other";
          institution: string | null;
          account_number: string | null;
          current_balance: number;
          currency: string;
          is_default: boolean;
          notes: string | null;
          color: string | null;
          icon: string | null;
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          account_type:
            | "checking"
            | "savings"
            | "credit"
            | "investment"
            | "other";
          institution?: string | null;
          account_number?: string | null;
          current_balance?: number;
          currency?: string;
          is_default?: boolean;
          notes?: string | null;
          color?: string | null;
          icon?: string | null;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          account_type?:
            | "checking"
            | "savings"
            | "credit"
            | "investment"
            | "other";
          institution?: string | null;
          account_number?: string | null;
          current_balance?: number;
          currency?: string;
          is_default?: boolean;
          notes?: string | null;
          color?: string | null;
          icon?: string | null;
          last_updated?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      budget_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          is_active: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          is_active?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          is_active?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_groups_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: "owner" | "admin" | "member" | "viewer";
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          role: "owner" | "admin" | "member" | "viewer";
          joined_at?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member" | "viewer";
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "budget_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      group_invitations: {
        Row: {
          id: string;
          group_id: string;
          invited_by: string;
          email: string;
          role: "admin" | "member" | "viewer";
          status: "pending" | "accepted" | "rejected" | "expired";
          token: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          invited_by: string;
          email: string;
          role: "admin" | "member" | "viewer";
          status: "pending" | "accepted" | "rejected" | "expired";
          token: string;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          invited_by?: string;
          email?: string;
          role?: "admin" | "member" | "viewer";
          status?: "pending" | "accepted" | "rejected" | "expired";
          token?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "budget_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      shared_categories: {
        Row: {
          group_id: string;
          category_id: string;
          shared_by: string;
          shared_at: string;
        };
        Insert: {
          group_id: string;
          category_id: string;
          shared_by: string;
          shared_at?: string;
        };
        Update: {
          group_id?: string;
          category_id?: string;
          shared_by?: string;
          shared_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shared_categories_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "budget_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_categories_shared_by_fkey";
            columns: ["shared_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      shared_budgets: {
        Row: {
          group_id: string;
          budget_id: string;
          shared_by: string;
          shared_at: string;
        };
        Insert: {
          group_id: string;
          budget_id: string;
          shared_by: string;
          shared_at?: string;
        };
        Update: {
          group_id?: string;
          budget_id?: string;
          shared_by?: string;
          shared_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shared_budgets_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "budget_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_budgets_budget_id_fkey";
            columns: ["budget_id"];
            isOneToOne: false;
            referencedRelation: "budgets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_budgets_shared_by_fkey";
            columns: ["shared_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      group_transactions: {
        Row: {
          id: string;
          group_id: string;
          created_by: string;
          category_id: string | null;
          amount: number;
          description: string | null;
          date: string;
          type: "expense" | "income";
          payment_method: string | null;
          status: "pending" | "completed" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          created_by: string;
          category_id?: string | null;
          amount: number;
          description?: string | null;
          date: string;
          type: "expense" | "income";
          payment_method?: string | null;
          status?: "pending" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          created_by?: string;
          category_id?: string | null;
          amount?: number;
          description?: string | null;
          date?: string;
          type?: "expense" | "income";
          payment_method?: string | null;
          status?: "pending" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_transactions_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "budget_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_transactions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      group_budgets: {
        Row: {
          id: string;
          group_id: string;
          created_by: string;
          category_id: string;
          name: string;
          amount: number;
          period: "daily" | "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          created_by: string;
          category_id: string;
          name: string;
          amount: number;
          period: "daily" | "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          created_by?: string;
          category_id?: string;
          name?: string;
          amount?: number;
          period?: "daily" | "weekly" | "monthly" | "yearly";
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_budgets_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "budget_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_budgets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_budgets_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      group_activity_log: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_activity_log_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "budget_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_activity_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          start_date: string;
          target_date: string | null;
          category_id: string | null;
          status: "in_progress" | "achieved" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          start_date: string;
          target_date?: string | null;
          category_id?: string | null;
          status?: "in_progress" | "achieved" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          start_date?: string;
          target_date?: string | null;
          category_id?: string | null;
          status?: "in_progress" | "achieved" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "financial_goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "financial_goals_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
