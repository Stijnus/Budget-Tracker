import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { BillWithCategory, BillInsert } from "../../../api/supabase/bills";
import { getCategories } from "../../../api/supabase/categories";
// No need for formatCurrency in this component

interface BillFormProps {
  bill?: BillWithCategory;
  onSubmit: (bill: BillInsert) => Promise<void>;
  onCancel: () => void;
}

export function BillForm({ bill, onSubmit, onCancel }: BillFormProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; color: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(bill?.name || "");
  const [amount, setAmount] = useState(bill?.amount?.toString() || "");
  const [dueDate, setDueDate] = useState(
    bill?.due_date || new Date().toISOString().split("T")[0]
  );
  const [frequency, setFrequency] = useState<
    "one-time" | "daily" | "weekly" | "monthly" | "yearly"
  >(bill?.frequency || "monthly");
  const [categoryId, setCategoryId] = useState(bill?.category_id || "");
  const [paymentMethod, setPaymentMethod] = useState(
    bill?.payment_method || ""
  );
  const [autoPay, setAutoPay] = useState(bill?.auto_pay || false);
  const [reminderDays, setReminderDays] = useState(
    bill?.reminder_days?.toString() || "7"
  );
  const [notes, setNotes] = useState(bill?.notes || "");
  const [status, setStatus] = useState<"active" | "paused" | "cancelled">(
    bill?.status || "active"
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

        // Set default category if none selected and categories are available
        if (!categoryId && expenseCategories.length > 0) {
          setCategoryId(expenseCategories[0].id);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    }

    fetchCategories();
  }, [categoryId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create a bill");
      return;
    }

    if (!name || !amount || !dueDate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const billData: BillInsert = {
        user_id: user.id,
        name,
        amount: parseFloat(amount),
        due_date: dueDate,
        frequency,
        category_id: categoryId || null,
        payment_method: paymentMethod || null,
        auto_pay: autoPay,
        reminder_days: parseInt(reminderDays) || 7,
        notes: notes || null,
        status,
      };

      await onSubmit(billData);
    } catch (err) {
      console.error("Error submitting bill:", err);
      setError("Failed to save bill");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}

      {/* Bill Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Bill Name *
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

      {/* Amount */}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Amount *
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
            className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label
          htmlFor="dueDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Due Date *
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      {/* Frequency */}
      <div>
        <label
          htmlFor="frequency"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Frequency *
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) =>
            setFrequency(
              e.target.value as
                | "one-time"
                | "daily"
                | "weekly"
                | "monthly"
                | "yearly"
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="one-time">One-time</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
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

      {/* Payment Method */}
      <div>
        <label
          htmlFor="paymentMethod"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Payment Method
        </label>
        <input
          type="text"
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="e.g., Credit Card, Bank Transfer"
        />
      </div>

      {/* Auto Pay */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoPay"
          checked={autoPay}
          onChange={(e) => setAutoPay(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="autoPay" className="ml-2 block text-sm text-gray-700">
          Auto Pay
        </label>
      </div>

      {/* Reminder Days */}
      <div>
        <label
          htmlFor="reminderDays"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Reminder Days Before Due
        </label>
        <input
          type="number"
          id="reminderDays"
          value={reminderDays}
          onChange={(e) => setReminderDays(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          min="0"
          max="30"
        />
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
            setStatus(e.target.value as "active" | "paused" | "cancelled")
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
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
          {isLoading ? "Saving..." : bill ? "Update Bill" : "Add Bill"}
        </button>
      </div>
    </form>
  );
}
