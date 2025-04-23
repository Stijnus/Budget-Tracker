import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { AlertCircle } from "lucide-react";
import {
  showItemCreatedToast,
  showItemUpdatedToast,
  showErrorToast,
} from "../../../utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [categoryId, setCategoryId] = useState(budget?.category_id || "all");
  const [period, setPeriod] = useState<"monthly" | "yearly" | "custom">(
    (budget?.period as "monthly" | "yearly") || "monthly"
  );
  const [startDate, setStartDate] = useState(
    budget?.start_date || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(budget?.end_date || "");
  // Description is not in the database schema, but we'll keep it for future use
  const [description, setDescription] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      if (!user) return;

      try {
        const { data, error } = await getCategories();
        if (error) throw error;

        // Filter to only expense categories or both
        const filteredCategories =
          data?.filter(
            (category) =>
              category.type === "expense" || category.type === "both"
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
        category_id: categoryId === "all" ? "" : categoryId,
        period: period === "custom" ? "monthly" : period,
        start_date: startDate,
        end_date: calculatedEndDate || null,
        // description field is not in the schema yet
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

      // Show success toast
      if (budget) {
        showItemUpdatedToast("budget");
      } else {
        showItemCreatedToast("budget");
      }

      // Success
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving budget:", err);
      setError("Failed to save budget");
      showErrorToast("Failed to save budget");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-md border shadow p-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Budget Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Budget Name</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Monthly Groceries"
            required
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Budget Amount</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              $
            </span>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
              className="pl-8"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Expenses</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Period */}
        <div className="space-y-2">
          <Label htmlFor="period">Budget Period</Label>
          <Select
            value={period}
            onValueChange={(value) =>
              setPeriod(value as "monthly" | "yearly" | "custom")
            }
          >
            <SelectTrigger id="period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">
              End Date {period !== "custom" && "(Optional)"}
            </Label>
            <Input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required={period === "custom"}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add notes or details about this budget..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : budget
              ? "Update Budget"
              : "Create Budget"}
          </Button>
        </div>
      </form>
    </div>
  );
}
