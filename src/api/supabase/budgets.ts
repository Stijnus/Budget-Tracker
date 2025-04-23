import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
export type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
export type BudgetUpdate = Database["public"]["Tables"]["budgets"]["Update"];

/**
 * Get current active budgets with spending information
 */
export async function getCurrentBudgets() {
  // Get current date
  const currentDate = new Date().toISOString().split("T")[0];

  // Get active budgets
  const { data: budgets, error: budgetsError } = await supabase
    .from("budgets")
    .select(
      `
      *,
      categories (
        name,
        color
      )
    `
    )
    .lte("start_date", currentDate)
    .or(`end_date.is.null,end_date.gte.${currentDate}`);

  if (budgetsError) {
    return { error: budgetsError };
  }

  // For each budget, calculate the amount spent
  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      // Determine date range based on budget period
      let startDate = new Date(budget.start_date);
      const endDate = budget.end_date ? new Date(budget.end_date) : new Date();

      // Adjust date range based on budget period
      if (budget.period === "monthly") {
        // If monthly, use current month
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      } else if (budget.period === "weekly") {
        // If weekly, use current week
        const day = endDate.getDay();
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - day);
      } else if (budget.period === "yearly") {
        // If yearly, use current year
        startDate = new Date(endDate.getFullYear(), 0, 1);
      }

      // Format dates for query
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      // Get transactions for this category in the date range
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("Amount")
        .eq("category_id", budget.category_id)
        .eq("type", "expense")
        .gte("date", formattedStartDate)
        .lte("date", formattedEndDate);

      if (transactionsError) {
        console.error(
          "Error fetching transactions for budget:",
          transactionsError
        );
        return {
          ...budget,
          spent: 0,
          category_name: budget.categories?.name,
          category_color: budget.categories?.color,
        };
      }

      // Calculate total spent
      const spent = transactions.reduce(
        (sum, t) => sum + ((t as any).amount || 0),
        0
      );

      return {
        ...budget,
        spent,
        category_name: budget.categories?.name,
        category_color: budget.categories?.color,
      };
    })
  );

  return { data: budgetsWithSpending, error: null };
}

/**
 * Create a new budget
 */
export async function createBudget(budget: BudgetInsert) {
  return supabase.from("budgets").insert(budget).select().single();
}

/**
 * Update an existing budget
 */
export async function updateBudget(id: string, updates: BudgetUpdate) {
  return supabase
    .from("budgets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string) {
  return supabase.from("budgets").delete().eq("id", id);
}

/**
 * Get all budgets with category information
 */
export async function getBudgets() {
  const { data, error } = await supabase
    .from("budgets")
    .select(
      `
      *,
      categories (
        name,
        color
      )
    `
    )
    .order("created_at", { ascending: false });

  // Transform the data to include category_name and category_color
  const transformedData = data
    ? data.map((budget) => ({
        ...budget,
        category_name: budget.categories?.name,
        category_color: budget.categories?.color,
        spent: 0, // Initialize spent to 0, will be calculated later if needed
      }))
    : [];

  return { data: transformedData, error };
}

/**
 * Get budget by ID with category information
 */
export async function getBudgetById(id: string) {
  const { data, error } = await supabase
    .from("budgets")
    .select(
      `
      *,
      categories (
        name,
        color
      )
    `
    )
    .eq("id", id)
    .single();

  // Transform the data to include category_name and category_color
  const transformedData = data
    ? {
        ...data,
        category_name: data.categories?.name,
        category_color: data.categories?.color,
      }
    : null;

  return { data: transformedData, error };
}
