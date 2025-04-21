import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { X } from "lucide-react";
import {
  createBudget,
  updateBudget,
  Budget,
  BudgetInsert,
} from "../../../api/supabase/budgets";
import { getCategories } from "../../../api/supabase/categories";

interface BudgetFormProps {
  budget?: Budget;
  onClose: () => void;
  onSuccess: () => void;
}

export function BudgetForm({ budget, onClose, onSuccess }: BudgetFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string; type: string }[]
  >([]);

  // Form state
  const [name, setName] = useState(budget?.name || "");
  const [amount, setAmount] = useState(budget?.amount?.toString() || "");
  const [categoryId, setCategoryId] = useState(budget?.category_id || "");
  const [period, setPeriod] = useState<"monthly" | "yearly" | "custom">(
    budget?.period || "monthly"
  );
  const [startDate, setStartDate] = useState(
    budget?.start_date || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    budget?.end_date || ""
  );
  const [description, setDescription] = useState(budget?.description || "");

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      if (!user) return;

      try {
        const { data, error } = await getCategories();
        if (error) throw error;
        
        // Filter to only expense categories or both
        const filteredCategories = data?.filter(
          (category) => category.type === "expense" || category.type === "both"
        ) || [];
        
        setCategories(filteredCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    }

    fetchCategories();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validate form
      if (!name.trim()) {
        setError("Please enter a budget name");
        return;
      }

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      if (!startDate) {
        setError("Please select a start date");
        return;
      }

      if (period === "custom" && !endDate) {
        setError("Please select an end date for custom period");
        return;
      }

      // Calculate end date for monthly/yearly periods if not provided
      let calculatedEndDate = endDate;
      if (period === "monthly" && !endDate) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(end.getDate() - 1);
        calculatedEndDate = end.toISOString().split("T")[0];
      } else if (period === "yearly" && !endDate) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);
        end.setDate(end.getDate() - 1);
        calculatedEndDate = end.toISOString().split("T")[0];
      }

      // Prepare budget data
      const budgetData: BudgetInsert = {
        user_id: user.id,
        name,
        amount: parseFloat(amount),
        category_id: categoryId || null,
        period,
        start_date: startDate,
        end_date: calculatedEndDate || null,
        description: description || null,
      };

      let result;
      if (budget) {
        // Update existing budget
        result = await updateBudget(budget.id, budgetData);
      } else {
        // Create new budget
        result = await createBudget(budgetData);
      }

      if (result.error) {
        throw result.error;
      }

      // Success
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving budget:", err);
      setError("Failed to save budget");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {budget ? "Edit Budget" : "Create Budget"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Budget Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Budget Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Monthly Groceries"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Budget Amount
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              $
            </span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
              className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Expenses</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Period */}
        <div>
          <label
            htmlFor="period"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Budget Period
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as "monthly" | "yearly" | "custom")}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date {period !== "custom" && "(Optional)"}
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required={period === "custom"}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Add notes or details about this budget..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Saving..."
              : budget
              ? "Update Budget"
              : "Create Budget"}
          </button>
        </div>
      </form>
    </div>
  );
}
