import { useState, useEffect } from "react";
// Translation imports removed
import { useAuth } from "../../../state/useAuth";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  createGroupTransaction,
  updateGroupTransaction,
  type GroupTransaction as ApiGroupTransaction,
} from "../../../api/supabase/groupTransactions";

// Extend the API type for our component
type GroupTransaction = ApiGroupTransaction & {
  category?: {
    id: string;
    name: string;
    type?: string;
    color?: string;
  } | null;
  creator?: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
};

interface GroupTransactionFormProps {
  groupId: string;
  transaction?: GroupTransaction;
  onSuccess: () => void;
}

export function GroupTransactionForm({
  groupId,
  transaction,
  onSuccess,
}: GroupTransactionFormProps) {
  // Translation hooks removed
  const { user } = useAuth();
  const [amount, setAmount] = useState(
    transaction ? transaction.amount.toString() : ""
  );
  const [description, setDescription] = useState(
    transaction?.description || ""
  );
  const [date, setDate] = useState<Date>(
    transaction?.date ? new Date(transaction.date) : new Date()
  );
  const [type, setType] = useState<"expense" | "income">(
    transaction?.type || "expense"
  );
  const [categoryId, setCategoryId] = useState(
    transaction?.category_id || "none"
  );
  const [paymentMethod, setPaymentMethod] = useState(
    transaction?.payment_method || "none"
  );
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled">(
    (transaction?.status as "pending" | "completed" | "cancelled") ||
      "completed"
  );
  const [notes, setNotes] = useState(transaction?.notes || "");
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

      // Prepare transaction data
      const transactionData = {
        group_id: groupId,
        created_by: user.id,
        amount: parseFloat(amount),
        description: description || null,
        date: format(date, "yyyy-MM-dd"),
        type,
        category_id: categoryId === "none" ? null : categoryId,
        payment_method: paymentMethod === "none" ? null : paymentMethod,
        status,
        notes: notes || null,
      };

      if (transaction) {
        // Update existing transaction
        const { error } = await updateGroupTransaction(
          transaction.id,
          transactionData
        );
        if (error) throw error;
      } else {
        // Create new transaction
        const { error } = await createGroupTransaction(transactionData);
        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      console.error("Error saving transaction:", err);
      setError(
        typeof err === "string"
          ? err
          : (err as Error).message || "Failed to save transaction"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    (category) => category.type === "both" || category.type === type
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Transaction Type */}
        <div className="space-y-2">
          <Label>{"TransactionType"}</Label>
          <RadioGroup
            value={type}
            onValueChange={(value) => setType(value as "expense" | "income")}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="cursor-pointer">
                {"Expense"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="income" />
              <Label htmlFor="income" className="cursor-pointer">
                {"Income"}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{"Amount"}</Label>
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

          {/* Date */}
          <div className="space-y-2">
            <Label>{"Date"}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">{"Description"}</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={"DescriptionPlaceholder"}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">{"Category"}</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder={"SelectCategory"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{"None"}</SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">{"PaymentMethod"}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder={"SelectPaymentMethod"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{"None"}</SelectItem>
                <SelectItem value="cash">{"Cash"}</SelectItem>
                <SelectItem value="credit_card">
                  {"CreditCard"}
                </SelectItem>
                <SelectItem value="debit_card">
                  {"DebitCard"}
                </SelectItem>
                <SelectItem value="bank_transfer">
                  {"BankTransfer"}
                </SelectItem>
                <SelectItem value="mobile_payment">
                  {"MobilePayment"}
                </SelectItem>
                <SelectItem value="other">{"Other"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">{"Status"}</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as "pending" | "completed" | "cancelled")
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder={"SelectStatus"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">{"Completed"}</SelectItem>
              <SelectItem value="pending">{"Pending"}</SelectItem>
              <SelectItem value="cancelled">{"Cancelled"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">{"Notes"}</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={"NotesPlaceholder"}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? transaction
              ? "Saving"
              : "Creating"
            : transaction
            ? "Save"
            : "Create"}
        </Button>
      </div>
    </form>
  );
}
