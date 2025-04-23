import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

export type Transaction =
  Database["public"]["Tables"]["transactions"]["Row"] & {
    category_name?: string;
    category_color?: string;
    bank_account_name?: string;
    categories?: {
      name?: string;
      color?: string;
    };
    bank_accounts?: {
      name?: string;
      account_type?: string;
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
  try {
    // First try with bank_accounts relationship
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        categories (
          name,
          color
        ),
        bank_accounts (
          name,
          account_type
        )
      `
      )
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      // If there's an error with the bank_accounts relationship, try without it
      console.warn("Error fetching transactions with bank_accounts:", error);

      const fallbackResult = await supabase
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
      const transformedData = fallbackResult.data?.map((transaction) => ({
        ...transaction,
        category_name: transaction.categories?.name,
        category_color: transaction.categories?.color,
        bank_account_name: null, // No bank account info available
      }));

      return { data: transformedData, error: fallbackResult.error };
    }

    // Transform the data to include category_name, category_color, and bank_account_name
    const transformedData = data?.map((transaction) => ({
      ...transaction,
      category_name: transaction.categories?.name,
      category_color: transaction.categories?.color,
      bank_account_name: transaction.bank_accounts?.name,
    }));

    return { data: transformedData, error };
  } catch (err) {
    console.error("Unexpected error in getRecentTransactions:", err);
    return { data: null, error: err as any };
  }
}

/**
 * Get transactions for a specific date range
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
) {
  try {
    // First try with bank_accounts relationship
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        categories (
          name,
          color
        ),
        bank_accounts (
          name,
          account_type
        )
      `
      )
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      // If there's an error with the bank_accounts relationship, try without it
      console.warn("Error fetching transactions with bank_accounts:", error);

      const fallbackResult = await supabase
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
      const transformedData = fallbackResult.data?.map((transaction) => ({
        ...transaction,
        category_name: transaction.categories?.name,
        category_color: transaction.categories?.color,
        bank_account_name: null, // No bank account info available
      }));

      return { data: transformedData, error: fallbackResult.error };
    }

    // Transform the data to include category_name, category_color, and bank_account_name
    const transformedData = data?.map((transaction) => ({
      ...transaction,
      category_name: transaction.categories?.name,
      category_color: transaction.categories?.color,
      bank_account_name: transaction.bank_accounts?.name,
    }));

    return { data: transformedData, error };
  } catch (err) {
    console.error("Unexpected error in getTransactionsByDateRange:", err);
    return { data: null, error: err as any };
  }
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
 * Get transactions by bank account
 */
export async function getTransactionsByBankAccount(
  bankAccountId: string,
  limit?: number
) {
  try {
    // First try with bank_accounts relationship
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        categories (
          name,
          color
        ),
        bank_accounts (
          name,
          account_type
        )
      `
      )
      .eq("bank_account_id", bankAccountId)
      .order("date", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      // If there's an error with the bank_accounts relationship, try without it
      console.warn("Error fetching transactions with bank_accounts:", error);

      let fallbackQuery = supabase
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
        .eq("bank_account_id", bankAccountId)
        .order("date", { ascending: false });

      if (limit) {
        fallbackQuery = fallbackQuery.limit(limit);
      }

      const fallbackResult = await fallbackQuery;

      // Transform the data to include category_name and category_color
      const transformedData = fallbackResult.data?.map((transaction) => ({
        ...transaction,
        category_name: transaction.categories?.name,
        category_color: transaction.categories?.color,
        bank_account_name: null, // No bank account info available
      }));

      return { data: transformedData, error: fallbackResult.error };
    }

    // Transform the data to include category_name, category_color, and bank_account_name
    const transformedData = data?.map((transaction) => ({
      ...transaction,
      category_name: transaction.categories?.name,
      category_color: transaction.categories?.color,
      bank_account_name: transaction.bank_accounts?.name,
    }));

    return { data: transformedData, error };
  } catch (err) {
    console.error("Unexpected error in getTransactionsByBankAccount:", err);
    return { data: null, error: err as any };
  }
}

/**
 * Get transaction by ID with category information
 */
export async function getTransactionById(id: string) {
  try {
    // First try with bank_accounts relationship
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        categories (
          name,
          color
        ),
        bank_accounts (
          name,
          account_type
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      // If there's an error with the bank_accounts relationship, try without it
      console.warn("Error fetching transaction with bank_accounts:", error);

      const fallbackResult = await supabase
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
      const transformedData = fallbackResult.data
        ? {
            ...fallbackResult.data,
            category_name: fallbackResult.data.categories?.name,
            category_color: fallbackResult.data.categories?.color,
            bank_account_name: null, // No bank account info available
          }
        : null;

      return { data: transformedData, error: fallbackResult.error };
    }

    // Transform the data to include category_name, category_color, and bank_account_name
    const transformedData = data
      ? {
          ...data,
          category_name: data.categories?.name,
          category_color: data.categories?.color,
          bank_account_name: data.bank_accounts?.name,
        }
      : null;

    return { data: transformedData, error };
  } catch (err) {
    console.error("Unexpected error in getTransactionById:", err);
    return { data: null, error: err as any };
  }
}
