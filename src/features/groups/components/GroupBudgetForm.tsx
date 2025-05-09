import { useState, useEffect } from "react";
// Translation imports removed
import { useAuth } from "../../../state/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategories } from "../../../api/supabase/categories";
import {
  createGroupBudget,
  updateGroupBudget,

} from "../../../api/supabase/groupBudgets";

// Use the canonical GroupBudget type from the API
import type { GroupBudget } from "../../../api/supabase/groupBudgets";
// No local extension of GroupBudget needed; use as-is from API

interface GroupBudgetFormProps {
  groupId: string;
  budget?: GroupBudget;
  onSuccess: (budget?: { name: string }) => void;
}

export function GroupBudgetForm({
  groupId,
  budget,
  onSuccess,
}: GroupBudgetFormProps) {
  // Translation hooks removed
  const { user } = useAuth();
  const [name, setName] = useState(budget?.name || "");
  const [amount, setAmount] = useState(budget ? budget.amount.toString() : "");
  const [categoryId, setCategoryId] = useState(budget?.category_id || "");
  const [period, setPeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >(budget?.period || "monthly");
  const [startDate, setStartDate] = useState<Date>(
    budget?.start_date ? new Date(budget.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    budget?.end_date ? new Date(budget.end_date) : undefined
  );
  const [categories, setCategories] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate amount
      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Validate category
      if (!categoryId) {
        throw new Error("Please select a category");
      }

      // Prepare budget data
      const budgetData = {
        group_id: groupId,
        created_by: user.id,
        name,
        amount: parseFloat(amount),
        category_id: categoryId,
        period,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
      };

      if (budget) {
        // Update existing budget
        const { error } = await updateGroupBudget(budget.id, budgetData);
        if (error) throw error;
      } else {
        // Create new budget
        const { error } = await createGroupBudget(budgetData);
        if (error) throw error;
      }

      onSuccess({ name });
    } catch (err) {
      console.error("Error saving budget:", err);
      setError(
        typeof err === "string"
          ? err
          : (err as Error).message || "Failed to save budget"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Budget Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Budget Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter budget name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Period */}
        <div className="space-y-2">
          <Label htmlFor="period">Period</Label>
          <Select
            value={period}
            onValueChange={(value) =>
              setPeriod(value as "daily" | "weekly" | "monthly" | "yearly")
            }
          >
            <SelectTrigger id="period">
              <SelectValue placeholder="Select a period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date (Optional) */}
          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>No End Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left mb-2"
                    onClick={() => setEndDate(undefined)}
                  >
                    No End Date
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => setEndDate(date)}
                  disabled={(date) => date < startDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? budget
              ? "Saving"
              : "Creating"
            : budget
            ? "Save"
            : "Create"}
        </Button>
      </div>
    </form>
  );
}
