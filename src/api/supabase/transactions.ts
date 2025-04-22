import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

export type Transaction =
  Database["public"]["Tables"]["transactions"]["Row"] & {
    category_name?: string;
    category_color?: string;
    categories?: {
      name?: string;
      color?: string;
    };
  };
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];

/**
 * Get recent transactions with category information
 */
export async function getRecentTransactions(limit = 10) {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      categories (
        name,
        color
      )
    `
    )
    .order("date", { ascending: false })
    .limit(limit);

  // Transform the data to include category_name and category_color
  const transformedData = data?.map((transaction) => ({
    ...transaction,
    category_name: transaction.categories?.name,
    category_color: transaction.categories?.color,
  }));

  return { data: transformedData, error };
}

/**
 * Get transactions for a specific date range
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      categories (
        name,
        color
      )
    `
    )
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  // Transform the data to include category_name and category_color
  const transformedData = data?.map((transaction) => ({
    ...transaction,
    category_name: transaction.categories?.name,
    category_color: transaction.categories?.color,
  }));

  return { data: transformedData, error };
}

/**
 * Get monthly spending summary
 */
export async function getMonthlySpending() {
  // Get current month's start and end dates
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  // Get all transactions for the current month
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("date", startOfMonth)
    .lte("date", endOfMonth);

  if (error) {
    return { error };
  }

  // Calculate totals
  const totalIncome = data
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = data
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netSavings = totalIncome - totalExpenses;

  // Get month name
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return {
    data: {
      totalIncome,
      totalExpenses,
      netSavings,
      month: monthNames[now.getMonth()],
      year: now.getFullYear(),
    },
    error: null,
  };
}

/**
 * Create a new transaction
 */
export async function createTransaction(transaction: TransactionInsert) {
  return supabase.from("transactions").insert(transaction).select().single();
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  id: string,
  updates: TransactionUpdate
) {
  return supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string) {
  return supabase.from("transactions").delete().eq("id", id);
}

/**
 * Get transaction by ID with category information
 */
export async function getTransactionById(id: string) {
  const { data, error } = await supabase
    .from("transactions")
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
