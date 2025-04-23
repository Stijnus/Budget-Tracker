import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { GoalWithCategory, GoalInsert } from "../../../api/supabase/goals";
import {
  showItemCreatedToast,
  showItemUpdatedToast,
  showErrorToast,
} from "../../../utils/toast";
import { getCategories } from "../../../api/supabase/categories";
import { AlertCircle, DollarSign } from "lucide-react";
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
  const [categoryId, setCategoryId] = useState(goal?.category_id || "none");
  const [notes, setNotes] = useState(goal?.notes || "");
  const [status, setStatus] = useState<
    "in_progress" | "achieved" | "cancelled"
  >(goal?.status || "in_progress");

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
        category_id: categoryId === "none" ? null : categoryId,
        notes: notes || null,
        status,
      };

      await onSubmit(goalData);

      // Show success toast
      if (goal) {
        showItemUpdatedToast("goal");
      } else {
        showItemCreatedToast("goal");
      }
    } catch (err) {
      console.error("Error submitting goal:", err);
      setError("Failed to save goal");
      showErrorToast("Failed to save goal");
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
        {/* Goal Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Goal Name *</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Target Amount */}
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target Amount *</Label>
          <div className="relative">
            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              id="targetAmount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="pl-8"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        {/* Current Amount */}
        <div className="space-y-2">
          <Label htmlFor="currentAmount">Current Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              id="currentAmount"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="pl-8"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        {/* Target Date */}
        <div className="space-y-2">
          <Label htmlFor="targetDate">Target Date</Label>
          <Input
            type="date"
            id="targetDate"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as "in_progress" | "achieved" | "cancelled")
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="achieved">Achieved</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : goal ? "Update Goal" : "Add Goal"}
          </Button>
        </div>
      </form>
    </div>
  );
}
