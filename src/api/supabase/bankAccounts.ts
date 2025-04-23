import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

export type BankAccount = Database["public"]["Tables"]["bank_accounts"]["Row"];
export type BankAccountInsert =
  Database["public"]["Tables"]["bank_accounts"]["Insert"];
export type BankAccountUpdate =
  Database["public"]["Tables"]["bank_accounts"]["Update"];

/**
 * Get all bank accounts for the current user
 */
export async function getBankAccounts() {
  return supabase.from("bank_accounts").select("*").order("name");
}

/**
 * Get a bank account by ID
 */
export async function getBankAccountById(id: string) {
  return supabase.from("bank_accounts").select("*").eq("id", id).single();
}

/**
 * Create a new bank account
 */
export async function createBankAccount(account: BankAccountInsert) {
  // If this is the first account or is_default is true, make sure it's the only default
  if (account.is_default) {
    await supabase
      .from("bank_accounts")
      .update({ is_default: false })
      .eq("is_default", true);
  }

  return supabase.from("bank_accounts").insert(account).select().single();
}

/**
 * Update an existing bank account
 */
export async function updateBankAccount(
  id: string,
  updates: BankAccountUpdate
) {
  // If setting this account as default, unset all other defaults
  if (updates.is_default) {
    await supabase
      .from("bank_accounts")
      .update({ is_default: false })
      .eq("is_default", true);
  }

  // Update the last_updated timestamp
  const updatedAccount = {
    ...updates,
    last_updated: new Date().toISOString(),
  };

  return supabase
    .from("bank_accounts")
    .update(updatedAccount)
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete a bank account
 */
export async function deleteBankAccount(id: string) {
  // Check if this is the default account
  const { data } = await supabase
    .from("bank_accounts")
    .select("Is Default")
    .eq("id", id)
    .single();

  // If this is the default account, find another account to make default
  if ((data as any)?.is_default) {
    const { data: otherAccounts } = await supabase
      .from("bank_accounts")
      .select("id")
      .neq("id", id)
      .limit(1);

    if (otherAccounts && otherAccounts.length > 0) {
      await supabase
        .from("bank_accounts")
        .update({ is_default: true })
        .eq("id", (otherAccounts[0] as any).id);
    }
  }

  return supabase.from("bank_accounts").delete().eq("id", id);
}

/**
 * Get the default bank account
 */
export async function getDefaultBankAccount() {
  return supabase
    .from("bank_accounts")
    .select("*")
    .eq("is_default", true)
    .single();
}

/**
 * Set a bank account as the default
 */
export async function setDefaultBankAccount(id: string) {
  // First, unset all default accounts
  await supabase
    .from("bank_accounts")
    .update({ is_default: false })
    .eq("is_default", true);

  // Then set the new default account
  return supabase
    .from("bank_accounts")
    .update({ is_default: true })
    .eq("id", id)
    .select()
    .single();
}

/**
 * Update the balance of a bank account
 */
export async function updateBankAccountBalance(id: string, newBalance: number) {
  return supabase
    .from("bank_accounts")
    .update({
      current_balance: newBalance,
      last_updated: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
}

/**
 * Get bank accounts by type
 */
export async function getBankAccountsByType(
  type: "checking" | "savings" | "credit" | "investment" | "other"
) {
  return supabase
    .from("bank_accounts")
    .select("*")
    .eq("account_type", type)
    .order("name");
}

/**
 * Get total balance across all accounts
 */
export async function getTotalBalance() {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("current_balance, account_type");

  if (error) {
    return { data: null, error };
  }

  // Calculate total balance (credit accounts are negative)
  const totalBalance = data.reduce((sum, account) => {
    // For credit accounts, the balance is typically negative (what you owe)
    const balance =
      (account as any).account_type === "credit"
        ? -Math.abs((account as any).current_balance)
        : (account as any).current_balance;

    return sum + balance;
  }, 0);

  return {
    data: {
      totalBalance,
      // Also calculate totals by account type
      checking: data
        .filter((a) => (a as any).account_type === "checking")
        .reduce((sum, a) => sum + (a as any).current_balance, 0),
      savings: data
        .filter((a) => (a as any).account_type === "savings")
        .reduce((sum, a) => sum + (a as any).current_balance, 0),
      credit: data
        .filter((a) => (a as any).account_type === "credit")
        .reduce((sum, a) => sum + (a as any).current_balance, 0),
      investment: data
        .filter((a) => (a as any).account_type === "investment")
        .reduce((sum, a) => sum + (a as any).current_balance, 0),
      other: data
        .filter((a) => (a as any).account_type === "other")
        .reduce((sum, a) => sum + (a as any).current_balance, 0),
    },
    error: null,
  };
}
