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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createTransaction,
  updateTransaction,
  Transaction,
  TransactionInsert,
} from "../../../api/supabase/transactions";
import { getCategories } from "../../../api/supabase/categories";
import { TagSelector } from "../../tags/components/TagSelector";
import { getTagsForTransaction } from "../../../api/supabase/tags";
import { getBankAccounts } from "../../../api/supabase/bankAccounts";

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: "expense" | "income";
}

export function TransactionForm({
  transaction,
  onClose,
  onSuccess,
  defaultType,
}: TransactionFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const [bankAccounts, setBankAccounts] = useState<
    { id: string; name: string; account_type: string; is_default: boolean }[]
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
    transaction?.type || defaultType || "expense"
  );
  const [categoryId, setCategoryId] = useState(
    transaction?.category_id || "none"
  );
  const [paymentMethod, setPaymentMethod] = useState(
    transaction?.payment_method || "none"
  );
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled">(
    transaction?.status || "completed"
  );
  const [notes, setNotes] = useState(transaction?.notes || "");
  const [bankAccountId, setBankAccountId] = useState(
    transaction?.bank_account_id || "none"
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Fetch categories and tags
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } =
          await getCategories();

        if (categoriesError) throw categoriesError;

        // Filter categories by type if adding a new transaction with a specific type
        let filteredCategories = categoriesData || [];
        if (!transaction && defaultType) {
          filteredCategories = filteredCategories.filter(
            (cat) => cat.type === defaultType.toUpperCase()
          );
        }

        setCategories(filteredCategories);

        // Fetch tags for existing transaction
        if (transaction?.id) {
          try {
            const { data: tagsData, error: tagsError } =
              await getTagsForTransaction(transaction.id);

            if (tagsError) throw tagsError;

            setSelectedTagIds(
              tagsData?.map((tag: { tag_id: string }) => tag.tag_id) || []
            );
          } catch (tagErr) {
            console.warn("Error fetching tags:", tagErr);
            // Continue without tags
            setSelectedTagIds([]);
          }
        }

        try {
          // Fetch bank accounts
          const { data: accountsData, error: accountsError } =
            await getBankAccounts();
          if (accountsError) throw accountsError;
          setBankAccounts(accountsData || []);

          // If no bank account is selected and there's a default account, select it
          if (bankAccountId === "none" && !transaction?.bank_account_id) {
            const defaultAccount = accountsData?.find(
              (account) => account.is_default
            );
            if (defaultAccount) {
              setBankAccountId(defaultAccount.id);
            }
          }
        } catch (accountErr) {
          console.warn("Error fetching bank accounts:", accountErr);
          // Continue without bank accounts
          setBankAccounts([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user, bankAccountId, transaction?.bank_account_id, transaction?.id, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      // Validate form
      if (!amount || isNaN(parseFloat(amount))) {
        setError("Please enter a valid amount.");
        return;
      }

      if (!date) {
        setError("Please select a date.");
        return;
      }

      // Prepare transaction data
      if (!user?.id) {
        setError("You must be logged in to add a transaction");
        return;
      }
      const transactionData: TransactionInsert = {
        user_id: user.id,
        amount: parseFloat(amount),
        description: description || null,
        date,
        type,
        category_id: categoryId === "none" ? null : categoryId,
        bank_account_id: bankAccountId === "none" ? null : bankAccountId,
        payment_method: paymentMethod === "none" ? null : paymentMethod,
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

      // Show success toast
      if (transaction) {
        showItemUpdatedToast("Transaction");
      } else {
        showItemCreatedToast("Transaction");
      }

      // Success
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving transaction:", err);
      setError("Failed to save transaction. Please try again.");
      showErrorToast("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type */}
        {defaultType ? (
          <div className="mb-2">
            <span className={`text-sm font-medium ${defaultType === 'expense' ? 'text-red-600' : 'text-green-600'}`}>{defaultType === 'expense' ? 'Expense' : 'Income'}</span>
          </div>
        ) : (
          <Tabs
            defaultValue={type}
            onValueChange={(value) => setType(value as "expense" | "income")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="expense"
                className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
              >
                Expense
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
              >
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
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

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={categoryId}
            onValueChange={setCategoryId}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {categories
                .filter(
                  (cat) =>
                    !type ||
                    cat.type === type.toUpperCase() ||
                    cat.type === "BOTH"
                )
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bank Account */}
        <div className="space-y-2">
          <Label htmlFor="bankAccount">Bank Account</Label>
          <Select
            value={bankAccountId}
            onValueChange={setBankAccountId}
          >
            <SelectTrigger id="bankAccount">
              <SelectValue placeholder="Select a bank account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            value={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Select a payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="debit_card">Debit Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as "pending" | "completed" | "cancelled")
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
            placeholder="Add any additional notes"
            rows={3}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <TagSelector
            transactionId={transaction?.id}
            selectedTagIds={selectedTagIds}
            onTagsChange={setSelectedTagIds}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className={type === "expense" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isLoading
              ? "Saving..."
              : transaction
              ? "Update Transaction"
              : "Add Transaction"}
          </Button>
        </div>
      </form>
    </div>
  );
}
