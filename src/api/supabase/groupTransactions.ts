import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

export type GroupTransaction = Database["public"]["Tables"]["group_transactions"]["Row"];
export type GroupTransactionInsert = Database["public"]["Tables"]["group_transactions"]["Insert"];
export type GroupTransactionUpdate = Database["public"]["Tables"]["group_transactions"]["Update"];

/**
 * Get all transactions for a group
 */
export async function getGroupTransactions(groupId: string) {
  return supabase
    .from("group_transactions")
    .select(`
      *,
      category:category_id(*),
      creator:created_by(
        id,
        user_profiles!inner(
          full_name,
          avatar_url
        )
      )
    `)
    .eq("group_id", groupId)
    .order("date", { ascending: false });
}

/**
 * Get a group transaction by ID
 */
export async function getGroupTransaction(id: string) {
  return supabase
    .from("group_transactions")
    .select(`
      *,
      category:category_id(*),
      creator:created_by(
        id,
        user_profiles!inner(
          full_name,
          avatar_url
        )
      )
    `)
    .eq("id", id)
    .single();
}

/**
 * Create a new group transaction
 */
export async function createGroupTransaction(transaction: GroupTransactionInsert) {
  return supabase
    .from("group_transactions")
    .insert(transaction)
    .select()
    .single();
}

/**
 * Update a group transaction
 */
export async function updateGroupTransaction(id: string, updates: GroupTransactionUpdate) {
  return supabase
    .from("group_transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete a group transaction
 */
export async function deleteGroupTransaction(id: string) {
  return supabase
    .from("group_transactions")
    .delete()
    .eq("id", id);
}

/**
 * Get group transactions by date range
 */
export async function getGroupTransactionsByDateRange(
  groupId: string,
  startDate: string,
  endDate: string
) {
  return supabase
    .from("group_transactions")
    .select(`
      *,
      category:category_id(*),
      creator:created_by(
        id,
        user_profiles!inner(
          full_name,
          avatar_url
        )
      )
    `)
    .eq("group_id", groupId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });
}

/**
 * Get group transactions by category
 */
export async function getGroupTransactionsByCategory(groupId: string, categoryId: string) {
  return supabase
    .from("group_transactions")
    .select(`
      *,
      category:category_id(*),
      creator:created_by(
        id,
        user_profiles!inner(
          full_name,
          avatar_url
        )
      )
    `)
    .eq("group_id", groupId)
    .eq("category_id", categoryId)
    .order("date", { ascending: false });
}

/**
 * Get group transactions by type (expense/income)
 */
export async function getGroupTransactionsByType(groupId: string, type: "expense" | "income") {
  return supabase
    .from("group_transactions")
    .select(`
      *,
      category:category_id(*),
      creator:created_by(
        id,
        user_profiles!inner(
          full_name,
          avatar_url
        )
      )
    `)
    .eq("group_id", groupId)
    .eq("type", type)
    .order("date", { ascending: false });
}

/**
 * Get group transactions by creator
 */
export async function getGroupTransactionsByCreator(groupId: string, creatorId: string) {
  return supabase
    .from("group_transactions")
    .select(`
      *,
      category:category_id(*),
      creator:created_by(
        id,
        user_profiles!inner(
          full_name,
          avatar_url
        )
      )
    `)
    .eq("group_id", groupId)
    .eq("created_by", creatorId)
    .order("date", { ascending: false });
}

/**
 * Get group transactions summary (total income, total expenses)
 */
export async function getGroupTransactionsSummary(groupId: string) {
  const { data: transactions, error } = await supabase
    .from("group_transactions")
    .select("amount, type")
    .eq("group_id", groupId);

  if (error) return { data: null, error };

  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  };

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      summary.totalIncome += transaction.amount;
    } else {
      summary.totalExpenses += transaction.amount;
    }
  });

  summary.balance = summary.totalIncome - summary.totalExpenses;

  return { data: summary, error: null };
}
