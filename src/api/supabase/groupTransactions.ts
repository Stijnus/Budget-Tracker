import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

// Define the creator type
type Creator = {
  id: string;
  user_profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
};

// Extend the base transaction type with the creator
export type GroupTransaction =
  Database["public"]["Tables"]["group_transactions"]["Row"] & {
    creator?: Creator;
    category?: Database["public"]["Tables"]["categories"]["Row"] | null;
  };

export type GroupTransactionInsert =
  Database["public"]["Tables"]["group_transactions"]["Insert"];
export type GroupTransactionUpdate =
  Database["public"]["Tables"]["group_transactions"]["Update"];

/**
 * Get all transactions for a group
 */
export async function getGroupTransactions(groupId: string) {
  try {
    console.log(`Fetching transactions for group ID: ${groupId}`);

    // Use a different approach to join with user_profiles since the foreign key relationship
    // might not be properly recognized in the schema cache
    const { data: rawData, error } = await supabase
      .from("group_transactions")
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .eq("group_id", groupId)
      .order("date", { ascending: false });

    let data = rawData as GroupTransaction[] | null;

    // If we have transactions, fetch the creator information separately
    if (!error && data && data.length > 0) {
      // Get unique creator IDs
      const creatorIds = [...new Set(data.map((t) => t.created_by))];

      // Fetch user profiles for these creators
      const { data: userProfiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, full_name, avatar_url")
        .in("id", creatorIds);

      if (!profilesError && userProfiles) {
        // Add creator information to each transaction
        data = data.map((transaction) => {
          const creator = userProfiles.find(
            (profile) => profile.id === transaction.created_by
          );
          if (creator) {
            return {
              ...transaction,
              creator: {
                id: transaction.created_by,
                user_profiles: {
                  full_name: creator.full_name,
                  avatar_url: creator.avatar_url,
                },
              },
            };
          }
          return transaction;
        });
      } else {
        console.warn("Could not fetch user profiles:", profilesError);
      }
    }

    if (error) {
      console.error("Error fetching group transactions:", error);
      return { data: [], error };
    }

    console.log(`Retrieved ${data?.length || 0} transactions`);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getGroupTransactions:", err);
    return { data: [], error: err as Error };
  }
}

/**
 * Get a group transaction by ID
 */
export async function getGroupTransaction(id: string) {
  try {
    console.log(`Fetching transaction with ID: ${id}`);

    const { data: rawData, error } = await supabase
      .from("group_transactions")
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .eq("id", id)
      .single();

    let data = rawData as GroupTransaction | null;

    // If we have a transaction, fetch the creator information separately
    if (!error && data) {
      // Fetch user profile for the creator
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, full_name, avatar_url")
        .eq("id", data.created_by)
        .single();

      if (!profileError && userProfile) {
        // Add creator information to the transaction
        data = {
          ...data,
          creator: {
            id: data.created_by,
            user_profiles: {
              full_name: userProfile.full_name,
              avatar_url: userProfile.avatar_url,
            },
          },
        };
      } else {
        console.warn("Could not fetch user profile:", profileError);
      }
    }

    if (error) {
      console.error("Error fetching group transaction:", error);
      return { data: null, error };
    }

    console.log("Transaction data:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getGroupTransaction:", err);
    return { data: null, error: err as Error };
  }
}

/**
 * Create a new group transaction
 */
export async function createGroupTransaction(
  transaction: GroupTransactionInsert
) {
  try {
    console.log("Creating group transaction:", transaction);

    const { data, error } = await supabase
      .from("group_transactions")
      .insert(transaction)
      .select()
      .single();

    if (error) {
      console.error("Error creating group transaction:", error);
      return { data: null, error };
    }

    console.log("Group transaction created successfully:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in createGroupTransaction:", err);
    return { data: null, error: err as Error };
  }
}

/**
 * Update a group transaction
 */
export async function updateGroupTransaction(
  id: string,
  updates: GroupTransactionUpdate
) {
  try {
    console.log(`Updating group transaction ${id}:`, updates);

    const { data, error } = await supabase
      .from("group_transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating group transaction:", error);
      return { data: null, error };
    }

    console.log("Group transaction updated successfully:", data);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in updateGroupTransaction:", err);
    return { data: null, error: err as Error };
  }
}

/**
 * Delete a group transaction
 */
export async function deleteGroupTransaction(id: string) {
  try {
    console.log(`Deleting group transaction ${id}`);

    const { data, error } = await supabase
      .from("group_transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting group transaction:", error);
      return { data: null, error };
    }

    console.log("Group transaction deleted successfully");
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in deleteGroupTransaction:", err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get group transactions by date range
 */
export async function getGroupTransactionsByDateRange(
  groupId: string,
  startDate: string,
  endDate: string
) {
  try {
    console.log(
      `Fetching transactions for group ID: ${groupId} between ${startDate} and ${endDate}`
    );

    const { data: rawData, error } = await supabase
      .from("group_transactions")
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .eq("group_id", groupId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    let data = rawData as GroupTransaction[] | null;

    // If we have transactions, fetch the creator information separately
    if (!error && data && data.length > 0) {
      // Get unique creator IDs
      const creatorIds = [...new Set(data.map((t) => t.created_by))];

      // Fetch user profiles for these creators
      const { data: userProfiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, full_name, avatar_url")
        .in("id", creatorIds);

      if (!profilesError && userProfiles) {
        // Add creator information to each transaction
        data = data.map((transaction) => {
          const creator = userProfiles.find(
            (profile) => profile.id === transaction.created_by
          );
          if (creator) {
            return {
              ...transaction,
              creator: {
                id: transaction.created_by,
                user_profiles: {
                  full_name: creator.full_name,
                  avatar_url: creator.avatar_url,
                },
              },
            };
          }
          return transaction;
        });
      } else {
        console.warn("Could not fetch user profiles:", profilesError);
      }
    }

    if (error) {
      console.error("Error fetching group transactions:", error);
      return { data: [], error };
    }

    console.log(`Retrieved ${data?.length || 0} transactions`);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getGroupTransactionsByDateRange:", err);
    return { data: [], error: err as Error };
  }
}

/**
 * Get group transactions by category
 */
export async function getGroupTransactionsByCategory(
  groupId: string,
  categoryId: string
) {
  try {
    console.log(
      `Fetching transactions for group ${groupId} with category ${categoryId}`
    );

    const { data, error } = await supabase
      .from("group_transactions")
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .eq("group_id", groupId)
      .eq("category_id", categoryId)
      .order("date", { ascending: false });

    // If we have transactions, fetch the creator information separately
    if (!error && data && data.length > 0) {
      // Get unique creator IDs
      const creatorIds = [...new Set(data.map((t) => t.created_by))];

      // Fetch user profiles for these creators
      const { data: userProfiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, full_name, avatar_url")
        .in("id", creatorIds);

      if (!profilesError && userProfiles) {
        // Add creator information to each transaction
        data.forEach((transaction) => {
          const creator = userProfiles.find(
            (profile) => profile.id === transaction.created_by
          );
          if (creator) {
            (transaction as GroupTransaction).creator = {
              id: transaction.created_by,
              user_profiles: {
                full_name: creator.full_name,
                avatar_url: creator.avatar_url,
              },
            };
          }
        });
      } else {
        console.warn("Could not fetch user profiles:", profilesError);
      }
    }

    if (error) {
      console.error("Error fetching transactions by category:", error);
      return { data: [], error };
    }

    console.log(`Retrieved ${data?.length || 0} transactions by category`);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getGroupTransactionsByCategory:", err);
    return { data: [], error: err as Error };
  }
}

/**
 * Get group transactions by type (expense/income)
 */
export async function getGroupTransactionsByType(
  groupId: string,
  type: "expense" | "income"
) {
  try {
    console.log(`Fetching ${type} transactions for group ID: ${groupId}`);

    const { data: rawData, error } = await supabase
      .from("group_transactions")
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .eq("group_id", groupId)
      .eq("type", type)
      .order("date", { ascending: false });

    let data = rawData as GroupTransaction[] | null;

    // If we have transactions, fetch the creator information separately
    if (!error && data && data.length > 0) {
      // Get unique creator IDs
      const creatorIds = [...new Set(data.map((t) => t.created_by))];

      // Fetch user profiles for these creators
      const { data: userProfiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, full_name, avatar_url")
        .in("id", creatorIds);

      if (!profilesError && userProfiles) {
        // Add creator information to each transaction
        data = data.map((transaction) => {
          const creator = userProfiles.find(
            (profile) => profile.id === transaction.created_by
          );
          if (creator) {
            return {
              ...transaction,
              creator: {
                id: transaction.created_by,
                user_profiles: {
                  full_name: creator.full_name,
                  avatar_url: creator.avatar_url,
                },
              },
            };
          }
          return transaction;
        });
      } else {
        console.warn("Could not fetch user profiles:", profilesError);
      }
    }

    if (error) {
      console.error("Error fetching transactions by type:", error);
      return { data: [], error };
    }

    console.log(`Retrieved ${data?.length || 0} ${type} transactions`);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getGroupTransactionsByType:", err);
    return { data: [], error: err as Error };
  }
}

export async function getGroupTransactionsByCreator(
  groupId: string,
  creatorId: string
) {
  try {
    console.log(
      `Fetching transactions for group ID: ${groupId} created by ${creatorId}`
    );

    const { data: rawData, error } = await supabase
      .from("group_transactions")
      .select(
        `
        *,
        category:category_id(*)
      `
      )
      .eq("group_id", groupId)
      .eq("created_by", creatorId)
      .order("date", { ascending: false });

    let data = rawData as GroupTransaction[] | null;

    // If we have transactions, fetch the creator information separately
    if (!error && data && data.length > 0) {
      // Fetch user profile for the creator
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, full_name, avatar_url")
        .eq("id", creatorId)
        .single();

      if (!profileError && userProfile) {
        // Add creator information to each transaction
        data = data.map((transaction) => ({
          ...transaction,
          creator: {
            id: creatorId,
            user_profiles: {
              full_name: userProfile.full_name,
              avatar_url: userProfile.avatar_url,
            },
          },
        }));
      } else {
        console.warn("Could not fetch user profile:", profileError);
      }
    }

    if (error) {
      console.error("Error fetching transactions by creator:", error);
      return { data: [], error };
    }

    console.log(`Retrieved ${data?.length || 0} transactions by creator`);
    return { data, error: null };
  } catch (err) {
    console.error("Unexpected error in getGroupTransactionsByCreator:", err);
    return { data: [], error: err as Error };
  }
}

export async function getGroupTransactionsSummary(groupId: string) {
  try {
    console.log(`Calculating summary for group ID: ${groupId}`);

    const { data: transactions, error } = await supabase
      .from("group_transactions")
      .select("amount, type")
      .eq("group_id", groupId);

    if (error) {
      console.error("Error fetching transactions for summary:", error);
      return { data: null, error };
    }

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

    console.log("Calculated summary:", summary);
    return { data: summary, error: null };
  } catch (err) {
    console.error("Unexpected error in getGroupTransactionsSummary:", err);
    return { data: null, error: err as Error };
  }
}
