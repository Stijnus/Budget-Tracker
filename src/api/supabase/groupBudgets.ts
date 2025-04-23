import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

export type GroupBudget = Database["public"]["Tables"]["group_budgets"]["Row"];
export type GroupBudgetInsert = Database["public"]["Tables"]["group_budgets"]["Insert"];
export type GroupBudgetUpdate = Database["public"]["Tables"]["group_budgets"]["Update"];

/**
 * Get all budgets for a group
 */
export async function getGroupBudgets(groupId: string) {
  return supabase
    .from("group_budgets")
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
    .order("name");
}

/**
 * Get a group budget by ID
 */
export async function getGroupBudget(id: string) {
  return supabase
    .from("group_budgets")
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
 * Create a new group budget
 */
export async function createGroupBudget(budget: GroupBudgetInsert) {
  return supabase
    .from("group_budgets")
    .insert(budget)
    .select()
    .single();
}

/**
 * Update a group budget
 */
export async function updateGroupBudget(id: string, updates: GroupBudgetUpdate) {
  return supabase
    .from("group_budgets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete a group budget
 */
export async function deleteGroupBudget(id: string) {
  return supabase
    .from("group_budgets")
    .delete()
    .eq("id", id);
}

/**
 * Get group budgets by category
 */
export async function getGroupBudgetsByCategory(groupId: string, categoryId: string) {
  return supabase
    .from("group_budgets")
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
    .eq("category_id", categoryId);
}

/**
 * Get group budgets by period
 */
export async function getGroupBudgetsByPeriod(
  groupId: string,
  period: "daily" | "weekly" | "monthly" | "yearly"
) {
  return supabase
    .from("group_budgets")
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
    .eq("period", period);
}

/**
 * Get active group budgets (current date is between start_date and end_date or end_date is null)
 */
export async function getActiveGroupBudgets(groupId: string) {
  const today = new Date().toISOString().split("T")[0];
  
  return supabase
    .from("group_budgets")
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
    .lte("start_date", today)
    .or(`end_date.gte.${today},end_date.is.null`);
}

/**
 * Calculate budget progress (spent amount vs budget amount)
 */
export async function calculateGroupBudgetProgress(budgetId: string) {
  // Get the budget
  const { data: budget, error: budgetError } = await getGroupBudget(budgetId);
  
  if (budgetError) return { data: null, error: budgetError };
  
  // Get transactions for this category in the budget period
  const startDate = budget.start_date;
  const endDate = budget.end_date || new Date().toISOString().split("T")[0];
  
  const { data: transactions, error: transactionsError } = await supabase
    .from("group_transactions")
    .select("amount")
    .eq("group_id", budget.group_id)
    .eq("category_id", budget.category_id)
    .eq("type", "expense")
    .gte("date", startDate)
    .lte("date", endDate);
  
  if (transactionsError) return { data: null, error: transactionsError };
  
  // Calculate total spent
  const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  
  // Calculate progress percentage
  const progressPercentage = (totalSpent / budget.amount) * 100;
  
  return {
    data: {
      budgetId: budget.id,
      budgetAmount: budget.amount,
      spentAmount: totalSpent,
      remainingAmount: budget.amount - totalSpent,
      progressPercentage: Math.min(progressPercentage, 100),
      isOverBudget: totalSpent > budget.amount,
    },
    error: null,
  };
}
