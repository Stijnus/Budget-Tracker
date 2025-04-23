import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { X, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { t } = useTranslation();
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

  // Fetch transaction tags if editing
  useEffect(() => {
    if (transaction?.id) {
      async function fetchTransactionTags() {
        try {
          const { data, error } = await getTagsForTransaction(
            transaction?.id || ""
          );
          if (error) throw error;

          if (data) {
            const tagIds = data.map((item) => item.tag_id);
            setSelectedTagIds(tagIds);
          }
        } catch (err) {
          console.error("Error fetching transaction tags:", err);
        }
      }

      fetchTransactionTags();
    }
  }, [transaction]);

  // Fetch categories and bank accounts on mount
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } =
          await getCategories();
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

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
        setError(t("transactions.error.load"));
      }
    }

    fetchData();
  }, [user, bankAccountId, transaction?.bank_account_id]);

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
        setError(t("transactions.error.amount"));
        return;
      }

      if (!date) {
        setError(t("transactions.error.date"));
        return;
      }

      // Prepare transaction data
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
        showItemUpdatedToast("transaction");
      } else {
        showItemCreatedToast("transaction");
      }

      // Success
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving transaction:", err);
      setError(t("transactions.error.save"));
      showErrorToast(t("transactions.error.save"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">
          {transaction ? t("transactions.edit") : t("transactions.add")}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
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
                {t("transactions.expense")}
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
              >
                {t("transactions.income")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("transactions.amount")}</Label>
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
            <Label htmlFor="description">{t("transactions.description")}</Label>
            <Input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("transactions.description.placeholder")}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">{t("transactions.date")}</Label>
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
            <Label htmlFor="category">{t("transactions.category")}</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue
                  placeholder={t("transactions.category.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t("transactions.category.none")}
                </SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bank Account */}
          <div className="space-y-2">
            <Label htmlFor="bankAccount">{t("transactions.bankAccount")}</Label>
            <Select value={bankAccountId} onValueChange={setBankAccountId}>
              <SelectTrigger id="bankAccount">
                <SelectValue
                  placeholder={t("transactions.bankAccount.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t("transactions.bankAccount.none")}
                </SelectItem>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}{" "}
                    {account.is_default &&
                      t("transactions.bankAccount.default")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">
              {t("transactions.paymentMethod")}
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue
                  placeholder={t("transactions.paymentMethod.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t("transactions.paymentMethod.none")}
                </SelectItem>
                <SelectItem value="cash">
                  {t("transactions.paymentMethod.cash")}
                </SelectItem>
                <SelectItem value="credit_card">
                  {t("transactions.paymentMethod.creditCard")}
                </SelectItem>
                <SelectItem value="debit_card">
                  {t("transactions.paymentMethod.debitCard")}
                </SelectItem>
                <SelectItem value="bank_transfer">
                  {t("transactions.paymentMethod.bankTransfer")}
                </SelectItem>
                <SelectItem value="mobile_payment">
                  {t("transactions.paymentMethod.mobilePayment")}
                </SelectItem>
                <SelectItem value="other">
                  {t("transactions.paymentMethod.other")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">{t("transactions.status")}</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as "pending" | "completed" | "cancelled")
              }
            >
              <SelectTrigger id="status">
                <SelectValue
                  placeholder={t("transactions.status.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">
                  {t("transactions.status.completed")}
                </SelectItem>
                <SelectItem value="pending">
                  {t("transactions.status.pending")}
                </SelectItem>
                <SelectItem value="cancelled">
                  {t("transactions.status.cancelled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("transactions.notes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={t("transactions.notes.placeholder")}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t("transactions.tags")}</Label>
            <TagSelector
              transactionId={transaction?.id}
              selectedTagIds={selectedTagIds}
              onTagsChange={setSelectedTagIds}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline">
              {t("transactions.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("transactions.saving")
                : transaction
                ? t("transactions.update")
                : t("transactions.add")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
