import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { BillWithCategory, BillInsert } from "../../../api/supabase/bills";
import { getCategories } from "../../../api/supabase/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Bill Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Bill Name *</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            $
          </span>
          <Input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date *</Label>
        <Input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency *</Label>
        <Select
          value={frequency}
          onValueChange={(value) =>
            setFrequency(
              value as "one-time" | "daily" | "weekly" | "monthly" | "yearly"
            )
          }
        >
          <SelectTrigger id="frequency">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one-time">One-time</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={categoryId}
          onValueChange={(value) => setCategoryId(value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Input
          type="text"
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          placeholder="e.g., Credit Card, Bank Transfer"
        />
      </div>

      {/* Auto Pay */}
      <div className="flex items-center space-x-2">
        <Switch id="autoPay" checked={autoPay} onCheckedChange={setAutoPay} />
        <Label htmlFor="autoPay">Auto Pay</Label>
      </div>

      {/* Reminder Days */}
      <div className="space-y-2">
        <Label htmlFor="reminderDays">Reminder Days Before Due</Label>
        <Input
          type="number"
          id="reminderDays"
          value={reminderDays}
          onChange={(e) => setReminderDays(e.target.value)}
          min="0"
          max="30"
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value as "active" | "paused" | "cancelled")
          }
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
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
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : bill ? "Update Bill" : "Add Bill"}
        </Button>
      </div>
    </form>
  );
}
