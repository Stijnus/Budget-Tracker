import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { X } from "lucide-react";
import {
  createTransaction,
  updateTransaction,
  Transaction,
  TransactionInsert,
} from "../../../api/supabase/transactions";
import { getCategories } from "../../../api/supabase/categories";
// Import formatters as needed

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionForm({
  transaction,
  onClose,
  onSuccess,
}: TransactionFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string; type: string }[]
  >([]);

  // Form state
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
  const [description, setDescription] = useState(
    transaction?.description || ""
  );
  const [date, setDate] = useState(
    transaction?.date || new Date().toISOString().split("T")[0]
  );
  const [type, setType] = useState<"expense" | "income">(
    transaction?.type || "expense"
  );
  const [categoryId, setCategoryId] = useState(transaction?.category_id || "");
  const [paymentMethod, setPaymentMethod] = useState(
    transaction?.payment_method || ""
  );
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled">(
    transaction?.status || "completed"
  );
  const [notes, setNotes] = useState(transaction?.notes || "");

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      if (!user) return;

      try {
        const { data, error } = await getCategories();
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    }

    fetchCategories();
  }, [user]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    (category) => category.type === type || category.type === "both"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validate form
      if (!amount || isNaN(parseFloat(amount))) {
        setError("Please enter a valid amount");
        return;
      }

      if (!date) {
        setError("Please select a date");
        return;
      }

      // Prepare transaction data
      const transactionData: TransactionInsert = {
        user_id: user.id,
        amount: parseFloat(amount),
        description: description || null,
        date,
        type,
        category_id: categoryId || null,
        payment_method: paymentMethod || null,
        status,
        notes: notes || null,
      };

      let result;
      if (transaction) {
        // Update existing transaction
        result = await updateTransaction(transaction.id, transactionData);
      } else {
        // Create new transaction
        result = await createTransaction(transactionData);
      }

      if (result.error) {
        throw result.error;
      }

      // Success
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving transaction:", err);
      setError("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {transaction ? "Edit Transaction" : "Add Transaction"}
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
        {/* Transaction Type */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            type="button"
            className={`py-2 px-4 rounded-md text-center ${
              type === "expense"
                ? "bg-red-100 text-red-700 font-medium"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setType("expense")}
          >
            Expense
          </button>
          <button
            type="button"
            className={`py-2 px-4 rounded-md text-center ${
              type === "income"
                ? "bg-green-100 text-green-700 font-medium"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setType("income")}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Amount
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

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Grocery shopping"
          />
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category) => (
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
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select a payment method</option>
            <option value="cash">Cash</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_payment">Mobile Payment</option>
            <option value="other">Other</option>
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
              setStatus(e.target.value as "pending" | "completed" | "cancelled")
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
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
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Additional notes..."
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
              : transaction
              ? "Update Transaction"
              : "Add Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
