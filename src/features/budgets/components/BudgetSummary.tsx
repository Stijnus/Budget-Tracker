import { useState, useEffect } from "react";
import { getCurrentBudgets } from "../../../api/supabase/budgets";
import { formatCurrency } from "../../../utils/formatters";

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category_name?: string;
  category_color?: string;
}

export function BudgetSummary() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBudgets() {
      try {
        setIsLoading(true);
        const { data, error } = await getCurrentBudgets();

        if (error) {
          throw new Error(error.message);
        }

        setBudgets(data || []);
      } catch (err) {
        console.error("Error fetching budgets:", err);
        setError("Failed to load budgets");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBudgets();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>;
  }

  if (budgets.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p className="mb-4">Create your first budget to track your spending!</p>
        <button
          onClick={() => (window.location.href = "/budgets")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          Create Budget
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = Math.min(
            Math.round((budget.spent / budget.amount) * 100),
            100
          );
          const isOverBudget = budget.spent > budget.amount;

          return (
            <div key={budget.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{budget.name}</h3>
                <span className="text-sm text-gray-500">
                  {formatCurrency(budget.spent)} /{" "}
                  {formatCurrency(budget.amount)}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    isOverBudget ? "bg-red-600" : "bg-blue-600"
                  }`}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: isOverBudget
                      ? undefined
                      : budget.category_color,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {budget.category_name || "General"}
                </span>
                <span
                  className={`text-xs font-medium ${
                    isOverBudget ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => (window.location.href = "/budgets")}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          View All Budgets
        </button>
      </div>
    </div>
  );
}
