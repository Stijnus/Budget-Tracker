import { useState } from "react";
import { useAuth } from "../../../state/useAuth";
import { AlertCircle, Building, CreditCard, Wallet } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createBankAccount,
  updateBankAccount,
  BankAccount,
  BankAccountInsert,
} from "../../../api/supabase/bankAccounts";
import { CURRENCIES } from "../../../utils/constants";

interface BankAccountFormProps {
  account?: BankAccount;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: "checking" | "savings" | "credit" | "investment" | "other";
}

export function BankAccountForm({
  account,
  onClose,
  onSuccess,
  defaultType = "checking",
}: BankAccountFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(account?.name || "");
  const [accountType, setAccountType] = useState<
    "checking" | "savings" | "credit" | "investment" | "other"
  >(account?.account_type || defaultType);
  const [institution, setInstitution] = useState(account?.institution || "");
  const [accountNumber, setAccountNumber] = useState(
    account?.account_number || ""
  );
  const [currentBalance, setCurrentBalance] = useState(
    account?.current_balance?.toString() || "0"
  );
  const [currency, setCurrency] = useState(account?.currency || "USD");
  const [isDefault, setIsDefault] = useState(account?.is_default || false);
  const [notes, setNotes] = useState(account?.notes || "");
  const [color] = useState(account?.color || "#3B82F6"); // Default blue color, we don't need setColor yet

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validate form
      if (!name.trim()) {
        setError("Please enter an account name");
        return;
      }

      if (isNaN(parseFloat(currentBalance))) {
        setError("Please enter a valid balance");
        return;
      }

      // Prepare account data
      const accountData: BankAccountInsert = {
        user_id: user.id,
        name,
        account_type: accountType,
        institution: institution || null,
        account_number: accountNumber || null,
        current_balance: parseFloat(currentBalance),
        currency,
        is_default: isDefault,
        notes: notes || null,
        color: color || null,
        icon: null, // We'll add icon support later
      };

      let result;
      if (account) {
        // Update existing account
        result = await updateBankAccount(account.id, accountData);
      } else {
        // Create new account
        result = await createBankAccount(accountData);
      }

      if (result.error) {
        throw result.error;
      }

      // Show success toast
      if (account) {
        showItemUpdatedToast("bank account");
      } else {
        showItemCreatedToast("bank account");
      }

      // Success
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving bank account:", err);
      setError("Failed to save bank account");
      showErrorToast("Failed to save bank account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">
          {account ? "Edit Bank Account" : "Add Bank Account"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Account Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Checking, Savings Account"
              required
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type *</Label>
            <Select
              value={accountType}
              onValueChange={(value) =>
                setAccountType(
                  value as
                    | "checking"
                    | "savings"
                    | "credit"
                    | "investment"
                    | "other"
                )
              }
            >
              <SelectTrigger id="accountType">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <Label htmlFor="institution">Financial Institution</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g., Chase, Bank of America"
                className="pl-9"
              />
            </div>
          </div>

          {/* Account Number (masked) */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              Account Number (last 4 digits)
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => {
                  // Only allow up to 4 digits
                  const value = e.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 4);
                  setAccountNumber(value);
                }}
                placeholder="e.g., 1234"
                className="pl-9"
                maxLength={4}
              />
            </div>
          </div>

          {/* Current Balance */}
          <div className="space-y-2">
            <Label htmlFor="currentBalance">Current Balance *</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentBalance"
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                step="0.01"
                className="pl-9"
                required
              />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Account */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
            <Label htmlFor="isDefault">Set as default account</Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this account"
              rows={3}
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
                : account
                ? "Update Account"
                : "Add Account"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
