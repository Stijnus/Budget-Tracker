import { supabase } from "../api/supabase/client";

export interface TableCheckResult {
  exists: boolean;
  error: Error | null;
}

export interface DatabaseCheckResult {
  userProfiles: TableCheckResult;
  userSettings: TableCheckResult;
  categories: TableCheckResult;
  transactions: TableCheckResult;
  budgets: TableCheckResult;
  tags: TableCheckResult;
  transactionTags: TableCheckResult;
  billsSubscriptions: TableCheckResult;
  financialGoals: TableCheckResult;
  [key: string]: TableCheckResult;
}

// Function to check if all tables exist
export async function checkDatabaseTables(): Promise<DatabaseCheckResult> {
  try {
    // Check user_profiles table
    const { error: userProfilesError } = await supabase
      .from("user_profiles")
      .select("Id")
      .limit(1);

    // Check user_settings table
    const { error: userSettingsError } = await supabase
      .from("user_settings")
      .select("Id")
      .limit(1);

    // Check categories table
    const { error: categoriesError } = await supabase
      .from("categories")
      .select("Id")
      .limit(1);

    // Check transactions table
    const { error: transactionsError } = await supabase
      .from("transactions")
      .select("Id")
      .limit(1);

    // Check budgets table
    const { error: budgetsError } = await supabase
      .from("budgets")
      .select("Id")
      .limit(1);

    // Check tags table
    const { error: tagsError } = await supabase
      .from("tags")
      .select("Id")
      .limit(1);

    // Check transaction_tags table
    const { error: transactionTagsError } = await supabase
      .from("transaction_tags")
      .select("Transaction Id")
      .limit(1);

    // Check bills_subscriptions table
    const { error: billsSubscriptionsError } = await supabase
      .from("bills_subscriptions")
      .select("Id")
      .limit(1);

    // Check financial_goals table
    const { error: financialGoalsError } = await supabase
      .from("financial_goals")
      .select("Id")
      .limit(1);

    // Return results
    return {
      userProfiles: { exists: !userProfilesError, error: userProfilesError },
      userSettings: { exists: !userSettingsError, error: userSettingsError },
      categories: { exists: !categoriesError, error: categoriesError },
      transactions: { exists: !transactionsError, error: transactionsError },
      budgets: { exists: !budgetsError, error: budgetsError },
      tags: { exists: !tagsError, error: tagsError },
      transactionTags: {
        exists: !transactionTagsError,
        error: transactionTagsError,
      },
      billsSubscriptions: {
        exists: !billsSubscriptionsError,
        error: billsSubscriptionsError,
      },
      financialGoals: {
        exists: !financialGoalsError,
        error: financialGoalsError,
      },
    };
  } catch (error) {
    console.error("Error checking database tables:", error);
    // Return a default error state for all tables
    return {
      userProfiles: { exists: false, error: error as Error },
      userSettings: { exists: false, error: error as Error },
      categories: { exists: false, error: error as Error },
      transactions: { exists: false, error: error as Error },
      budgets: { exists: false, error: error as Error },
      tags: { exists: false, error: error as Error },
      transactionTags: { exists: false, error: error as Error },
      billsSubscriptions: { exists: false, error: error as Error },
      financialGoals: { exists: false, error: error as Error },
    };
  }
}
