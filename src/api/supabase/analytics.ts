import { supabase } from './client';

/**
 * Get expense data by category for a specific date range
 */
export async function getExpensesByCategory(startDate: string, endDate: string) {
  // Get all expense transactions with category information
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    return { error };
  }

  // Group transactions by category
  const categoryMap = new Map();
  
  transactions.forEach(transaction => {
    if (!transaction.categories) return;
    
    const categoryId = transaction.categories.id;
    const categoryName = transaction.categories.name;
    const categoryColor = transaction.categories.color;
    const amount = transaction.amount || 0;
    
    if (categoryMap.has(categoryId)) {
      categoryMap.get(categoryId).value += amount;
    } else {
      categoryMap.set(categoryId, {
        id: categoryId,
        name: categoryName,
        color: categoryColor,
        value: amount
      });
    }
  });
  
  // Convert map to array
  const categoryData = Array.from(categoryMap.values());
  
  return { data: categoryData, error: null };
}

/**
 * Get spending trend data for a specific date range (grouped by month or day)
 */
export async function getSpendingTrend(startDate: string, endDate: string, groupBy: 'day' | 'month' = 'month') {
  // Get all transactions in the date range
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('date, amount, type')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    return { error };
  }

  // Group transactions by date
  const dateMap = new Map();
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    let groupKey;
    
    if (groupBy === 'month') {
      // Format as YYYY-MM
      groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      // Format as YYYY-MM-DD
      groupKey = transaction.date;
    }
    
    if (!dateMap.has(groupKey)) {
      dateMap.set(groupKey, {
        date: groupKey,
        income: 0,
        expenses: 0
      });
    }
    
    const entry = dateMap.get(groupKey);
    
    if (transaction.type === 'income') {
      entry.income += transaction.amount || 0;
    } else {
      entry.expenses += transaction.amount || 0;
    }
  });
  
  // Convert map to array and sort by date
  const trendData = Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return { data: trendData, error: null };
}

/**
 * Get income vs expense data for a specific date range
 */
export async function getIncomeVsExpenses(startDate: string, endDate: string) {
  // Get all transactions in the date range
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    return { error };
  }

  // Calculate totals
  const result = {
    income: 0,
    expenses: 0
  };
  
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      result.income += transaction.amount || 0;
    } else {
      result.expenses += transaction.amount || 0;
    }
  });
  
  return { data: result, error: null };
}

/**
 * Get budget vs actual spending data
 */
export async function getBudgetVsActual() {
  // Get current date
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Calculate start and end of current month
  const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
  
  // Get all active budgets
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select(`
      id,
      name,
      amount,
      category_id,
      categories (
        name,
        color
      )
    `)
    .lte('start_date', endDate)
    .or(`end_date.is.null,end_date.gte.${startDate}`);
  
  if (budgetsError) {
    return { error: budgetsError };
  }
  
  // For each budget, get actual spending
  const budgetData = await Promise.all(
    budgets.map(async (budget) => {
      // Get transactions for this category in the date range
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('category_id', budget.category_id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (transactionsError) {
        console.error('Error fetching transactions for budget:', transactionsError);
        return {
          name: budget.name,
          budget: budget.amount,
          actual: 0,
          category: budget.categories?.name || 'Uncategorized',
          color: budget.categories?.color || '#CBD5E0'
        };
      }
      
      // Calculate total spent
      const actual = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      return {
        name: budget.name,
        budget: budget.amount,
        actual,
        category: budget.categories?.name || 'Uncategorized',
        color: budget.categories?.color || '#CBD5E0'
      };
    })
  );
  
  return { data: budgetData, error: null };
}
