import { supabase } from "./client";
import type { Database } from "../../lib/database.types";

export type Goal = Database["public"]["Tables"]["financial_goals"]["Row"];
export type GoalInsert =
  Database["public"]["Tables"]["financial_goals"]["Insert"];
export type GoalUpdate =
  Database["public"]["Tables"]["financial_goals"]["Update"];

// Extended Goal type with category information
export interface GoalWithCategory extends Goal {
  category_name?: string;
  category_color?: string;
  categories?: {
    name: string;
    color: string;
  } | null;
}

/**
 * Get all goals
 */
export async function getGoals(): Promise<{
  data: GoalWithCategory[] | null;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("financial_goals")
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
  const transformedData = data?.map((goal) => ({
    ...goal,
    category_name: goal.categories?.name,
    category_color: goal.categories?.color,
  }));

  return { data: transformedData || null, error };
}

/**
 * Get goal by ID
 */
export async function getGoalById(
  id: string
): Promise<{ data: GoalWithCategory | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("financial_goals")
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
 * Create a new goal
 */
export async function createGoal(goal: GoalInsert) {
  return supabase.from("financial_goals").insert(goal).select().single();
}

/**
 * Update an existing goal
 */
export async function updateGoal(id: string, updates: GoalUpdate) {
  return supabase
    .from("financial_goals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
}

/**
 * Delete a goal
 */
export async function deleteGoal(id: string) {
  return supabase.from("financial_goals").delete().eq("id", id);
}

/**
 * Add a contribution to a goal
 */
export async function addGoalContribution(
  goalId: string,
  amount: number,
  date = new Date(),
  notes?: string
) {
  // First, create the contribution record
  const { data: contribution, error: contributionError } = await supabase
    .from("goal_contributions")
    .insert({
      goal_id: goalId,
      amount,
      contribution_date: date.toISOString().split("T")[0],
      notes: notes || null,
    })
    .select()
    .single();

  if (contributionError) {
    return { data: null, error: contributionError };
  }

  // Then, update the goal's current_amount
  const { data: goal, error: goalError } = await getGoalById(goalId);

  if (goalError || !goal) {
    return {
      data: contribution,
      error: goalError || new Error("Goal not found"),
    };
  }

  const newCurrentAmount = (goal.current_amount || 0) + amount;
  const isCompleted = newCurrentAmount >= goal.target_amount;

  const { data: updatedGoal, error: updateError } = await updateGoal(goalId, {
    current_amount: newCurrentAmount,
    status: isCompleted ? "achieved" : goal.status,
  });

  if (updateError) {
    return { data: contribution, error: updateError };
  }

  return { data: { contribution, goal: updatedGoal }, error: null };
}

/**
 * Get contributions for a goal
 */
export async function getGoalContributions(goalId: string) {
  return supabase
    .from("goal_contributions")
    .select("*")
    .eq("goal_id", goalId)
    .order("contribution_date", { ascending: false });
}

/**
 * Calculate goal metrics
 */
export function calculateGoalMetrics(goal: Goal) {
  const currentAmount = goal.current_amount || 0;
  const targetAmount = goal.target_amount;

  // Calculate percentage complete
  const percentComplete = Math.min(
    Math.round((currentAmount / targetAmount) * 100),
    100
  );

  // Calculate time metrics
  const now = new Date();
  const startDate = new Date(goal.start_date);
  const targetDate = goal.target_date ? new Date(goal.target_date) : null;

  let timeRemainingDays = 0;
  let isOverdue = false;
  const daysElapsed = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (targetDate) {
    timeRemainingDays = Math.floor(
      (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    isOverdue = timeRemainingDays < 0 && percentComplete < 100;
  }

  // Calculate amount remaining
  const amountRemaining = targetAmount - currentAmount;

  // Calculate daily/monthly target if there's a target date
  let dailyTarget = 0;
  let monthlyTarget = 0;

  if (targetDate && timeRemainingDays > 0) {
    dailyTarget = amountRemaining / timeRemainingDays;
    monthlyTarget = (amountRemaining / timeRemainingDays) * 30;
  }

  return {
    percentComplete,
    amountRemaining,
    timeRemainingDays: Math.max(0, timeRemainingDays),
    isOverdue,
    daysElapsed,
    dailyTarget,
    monthlyTarget,
  };
}
