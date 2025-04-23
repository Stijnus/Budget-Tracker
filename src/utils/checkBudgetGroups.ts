import { supabase } from "../api/supabase/client";

/**
 * Check if the budget_groups table exists and create it if it doesn't
 */
export async function checkBudgetGroupsTables() {
  try {
    // Check if budget_groups table exists
    const { data: tableExists, error: tableError } = await supabase.rpc(
      "check_table_exists",
      { table_name: "budget_groups" }
    );

    if (tableError) {
      console.error("Error checking if budget_groups table exists:", tableError);
      
      // Create the check_table_exists function if it doesn't exist
      await supabase.rpc("create_check_table_exists_function");
      
      // Try again
      const { data: tableExistsRetry } = await supabase.rpc(
        "check_table_exists",
        { table_name: "budget_groups" }
      );
      
      if (!tableExistsRetry) {
        // Create the budget_groups table and related tables
        await createBudgetGroupsTables();
      }
    } else if (!tableExists) {
      // Create the budget_groups table and related tables
      await createBudgetGroupsTables();
    }

    return { success: true };
  } catch (error) {
    console.error("Error checking budget groups tables:", error);
    return { success: false, error };
  }
}

/**
 * Create the budget_groups table and related tables
 */
async function createBudgetGroupsTables() {
  try {
    // Create the budget_groups table
    await supabase.rpc("create_budget_groups_tables");
    return { success: true };
  } catch (error) {
    console.error("Error creating budget groups tables:", error);
    return { success: false, error };
  }
}
