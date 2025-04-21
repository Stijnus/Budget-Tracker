import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

export type Bill = Database["public"]["Tables"]["bills_subscriptions"]["Row"];
export type BillInsert =
  Database["public"]["Tables"]["bills_subscriptions"]["Insert"];
export type BillUpdate =
  Database["public"]["Tables"]["bills_subscriptions"]["Update"];

// Extended Bill type with category information
export interface BillWithCategory extends Bill {
  category_name?: string;
  category_color?: string;
  categories?: {
    name: string;
    color: string;
  } | null;
}

/**
 * Get all bills
 */
export async function getBills(): Promise<{
  data: BillWithCategory[] | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("bills_subscriptions")
    .select(
      `
      *,
      categories (
        name,
        color
      )
    `
    )
    .order("due_date", { ascending: true });

  // Transform the data to include category_name and category_color
  const transformedData = data?.map((bill) => ({
    ...bill,
    category_name: bill.categories?.name,
    category_color: bill.categories?.color,
  }));

  return { data: transformedData || null, error };
}

/**
 * Get upcoming bills (due within the next X days)
 */
export async function getUpcomingBills(
  days = 30
): Promise<{ data: BillWithCategory[] | null; error: Error | null }> {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  const startDate = today.toISOString().split("T")[0];
  const endDate = futureDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("bills_subscriptions")
    .select(
      `
      *,
      categories (
        name,
        color
      )
    `
    )
    .gte("next_due_date", startDate)
    .lte("next_due_date", endDate)
    .order("next_due_date", { ascending: true });

  // Transform the data to include category_name and category_color
  const transformedData = data?.map((bill) => ({
    ...bill,
    category_name: bill.categories?.name,
    category_color: bill.categories?.color,
  }));

  return { data: transformedData || null, error };
}

/**
 * Get bill by ID
 */
export async function getBillById(
  id: string
): Promise<{ data: BillWithCategory | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("bills_subscriptions")
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

/**
 * Create a new bill
 */
export async function createBill(bill: BillInsert) {
  // Calculate the next due date based on frequency
  const nextDueDate = bill.due_date
    ? calculateNextDueDate(bill.due_date, bill.frequency)
    : null;

  return supabase
    .from("bills_subscriptions")
    .insert({ ...bill, next_due_date: nextDueDate })
    .select()
    .single();
}

/**
 * Update an existing bill
 */
export async function updateBill(id: string, updates: BillUpdate) {
  // If due_date or frequency is updated, recalculate next_due_date
  let nextDueDate = updates.next_due_date;
  if (updates.due_date && updates.frequency) {
    nextDueDate = calculateNextDueDate(updates.due_date, updates.frequency);
  }

  return supabase
    .from("bills_subscriptions")
    .update({ ...updates, next_due_date: nextDueDate })
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete a bill
 */
export async function deleteBill(id: string) {
  return supabase.from("bills_subscriptions").delete().eq("id", id);
}

/**
 * Mark a bill as paid
 */
export async function markBillAsPaid(id: string, paymentDate = new Date()) {
  // Get the bill first
  const { data: bill, error: getBillError } = await getBillById(id);

  if (getBillError || !bill) {
    return { error: getBillError || new Error("Bill not found") };
  }

  // Calculate the next due date based on frequency
  const nextDueDate = bill.due_date
    ? calculateNextDueDate(bill.due_date, bill.frequency, paymentDate)
    : null;

  // Update the bill with the new last_paid_date and next_due_date
  const { data, error } = await supabase
    .from("bills_subscriptions")
    .update({
      last_paid_date: paymentDate.toISOString().split("T")[0],
      next_due_date: nextDueDate,
      payment_status: "paid",
    })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

/**
 * Calculate the next due date based on frequency
 */
function calculateNextDueDate(
  dueDate: string,
  frequency: "one-time" | "daily" | "weekly" | "monthly" | "yearly",
  fromDate = new Date()
): string {
  const dueDateObj = new Date(dueDate);

  // For one-time bills, the next due date is the same as the due date
  if (frequency === "one-time") {
    return dueDate;
  }

  // For recurring bills, calculate the next due date
  const nextDueDate = new Date(dueDateObj);

  // If the due date is in the past, calculate the next occurrence
  if (nextDueDate < fromDate) {
    const dayOfMonth = dueDateObj.getDate();

    switch (frequency) {
      case "daily":
        // Add days until we're in the future
        while (nextDueDate < fromDate) {
          nextDueDate.setDate(nextDueDate.getDate() + 1);
        }
        break;

      case "weekly":
        // Add weeks until we're in the future
        while (nextDueDate < fromDate) {
          nextDueDate.setDate(nextDueDate.getDate() + 7);
        }
        break;

      case "monthly":
        // Add months until we're in the future
        while (nextDueDate < fromDate) {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        // Try to maintain the same day of month
        nextDueDate.setDate(
          Math.min(
            dayOfMonth,
            new Date(
              nextDueDate.getFullYear(),
              nextDueDate.getMonth() + 1,
              0
            ).getDate()
          )
        );
        break;

      case "yearly":
        // Add years until we're in the future
        while (nextDueDate < fromDate) {
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        }
        break;
    }
  }

  return nextDueDate.toISOString().split("T")[0];
}

/**
 * Get payment history for a bill
 */
export async function getBillPaymentHistory(billId: string) {
  const { data, error } = await supabase
    .from("bill_payments")
    .select("*")
    .eq("bill_id", billId)
    .order("payment_date", { ascending: false });

  return { data, error };
}

/**
 * Add a payment record for a bill
 */
export async function addBillPayment(
  billId: string,
  amount: number,
  paymentDate = new Date(),
  paymentMethod?: string,
  notes?: string
) {
  const { data, error } = await supabase
    .from("bill_payments")
    .insert({
      bill_id: billId,
      amount,
      payment_date: paymentDate.toISOString().split("T")[0],
      payment_method: paymentMethod,
      notes,
    })
    .select()
    .single();

  if (!error) {
    // Also mark the bill as paid
    await markBillAsPaid(billId, paymentDate);
  }

  return { data, error };
}
