import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { GoalWithCategory, GoalInsert } from "../../../api/supabase/goals";
import { getCategories } from "../../../api/supabase/categories";

interface GoalFormProps {
  goal?: GoalWithCategory;
  onSubmit: (goal: GoalInsert) => Promise<void>;
  onCancel: () => void;
}

export function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; color: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(
    goal?.target_amount?.toString() || ""
  );
  const [currentAmount, setCurrentAmount] = useState(
    goal?.current_amount?.toString() || "0"
  );
  const [startDate, setStartDate] = useState(
    goal?.start_date || new Date().toISOString().split("T")[0]
  );
  const [targetDate, setTargetDate] = useState(goal?.target_date || "");
  const [categoryId, setCategoryId] = useState(goal?.category_id || "");
  const [notes, setNotes] = useState(goal?.notes || "");
  const [status, setStatus] = useState<"in_progress" | "achieved" | "cancelled">(
    goal?.status || "in_progress"
  );

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await getCategories();
        if (error) throw error;

        // Filter for expense categories only
        const expenseCategories =
          data?.filter(
            (cat) => cat.type === "expense" || cat.type === "both"
          ) || [];

        setCategories(expenseCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    }

    fetchCategories();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create a goal");
      return;
    }

    if (!name || !targetAmount || !startDate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const goalData: GoalInsert = {
        user_id: user.id,
        name,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount || "0"),
        start_date: startDate,
        target_date: targetDate || null,
        category_id: categoryId || null,
        notes: notes || null,
        status,
      };

      await onSubmit(goalData);
    } catch (err) {
      console.error("Error submitting goal:", err);
      setError("Failed to save goal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      {/* Goal Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Goal Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      {/* Target Amount */}
      <div>
        <label
          htmlFor="targetAmount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Target Amount *
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            $
          </span>
          <input
            type="number"
            id="targetAmount"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      {/* Current Amount */}
      <div>
        <label
          htmlFor="currentAmount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Current Amount
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            $
          </span>
          <input
            type="number"
            id="currentAmount"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* Start Date */}
      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Start Date *
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      {/* Target Date */}
      <div>
        <label
          htmlFor="targetDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Target Date
        </label>
        <input
          type="date"
          id="targetDate"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "in_progress" | "achieved" | "cancelled")
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="in_progress">In Progress</option>
          <option value="achieved">Achieved</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? "Saving..." : goal ? "Update Goal" : "Add Goal"}
        </button>
      </div>
    </form>
  );
}
