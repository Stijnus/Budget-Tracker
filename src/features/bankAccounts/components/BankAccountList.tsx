import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBankAccounts,
  getBankAccountsByType,
  deleteBankAccount,
  setDefaultBankAccount,
  BankAccount,
} from "../../../api/supabase/bankAccounts";
import { formatCurrency } from "../../../utils/formatters";
import { showItemDeletedToast, showErrorToast } from "../../../utils/toast";
import {
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  Loader2,
  Star,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface BankAccountListProps {
  onEdit: (account: BankAccount) => void;
  showAddButton?: boolean;
  onAdd?: () => void;
  accountType?: "checking" | "savings" | "credit" | "investment" | "other";
}

export function BankAccountList({
  onEdit,
  showAddButton = true,
  onAdd,
  accountType,
}: BankAccountListProps) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  // Load accounts
  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use filtered query if accountType is provided
      const { data, error } = accountType
        ? await getBankAccountsByType(accountType)
        : await getBankAccounts();

      if (error) throw error;

      setAccounts(data || []);

      // Calculate total balance (credit accounts are negative)
      const total =
        data?.reduce((sum, account) => {
          const balance =
            account.account_type === "credit"
              ? -Math.abs(account.current_balance)
              : account.current_balance;
          return sum + balance;
        }, 0) || 0;

      setTotalBalance(total);
    } catch (err) {
      console.error("Error loading bank accounts:", err);
      setError("Failed to load bank accounts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [accountType]);

  // Load accounts on component mount or when accountType changes
  useEffect(() => {
    loadAccounts();
  }, [accountType, loadAccounts]);

  // Handle account deletion
  const handleDeleteClick = (id: string) => {
    setAccountToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    try {
      const { error } = await deleteBankAccount(accountToDelete);
      if (error) throw error;

      // Show success toast
      showItemDeletedToast("Bank account");

      // Reload accounts
      loadAccounts();
    } catch (err) {
      console.error("Error deleting bank account:", err);
      showErrorToast("Failed to delete bank account");
    } finally {
      setIsDeleteConfirmOpen(false);
      setAccountToDelete(null);
    }
  };

  // Handle setting default account
  const handleSetDefault = async (id: string) => {
    try {
      const { error } = await setDefaultBankAccount(id);
      if (error) throw error;

      // Reload accounts
      loadAccounts();
    } catch (err) {
      console.error("Error setting default account:", err);
      showErrorToast("Failed to set default account");
    }
  };

  // Get icon for account type
  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <Wallet className="h-4 w-4" />;
      case "savings":
        return <PiggyBank className="h-4 w-4" />;
      case "credit":
        return <CreditCard className="h-4 w-4" />;
      case "investment":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  // Handle add account button click
  const handleAddAccount = () => {
    if (onAdd) {
      onAdd();
    } else {
      navigate("/accounts/new");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Balance Card */}
      <Card className="border-t-4 border-t-blue-500 bg-gradient-to-br from-blue-50/50 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
            {accountType
              ? `Total ${
                  accountType.charAt(0).toUpperCase() + accountType.slice(1)
                } Balance`
              : "Total Balance"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <Card className="border-t-4 border-t-blue-500">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-xl flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-blue-500" />
            {accountType
              ? `Your ${
                  accountType.charAt(0).toUpperCase() + accountType.slice(1)
                } Accounts`
              : "Your Accounts"}
          </CardTitle>
          {showAddButton && (
            <Button
              onClick={handleAddAccount}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Account
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No {accountType || "bank"} accounts found.{" "}
              {showAddButton && (
                <Button
                  onClick={handleAddAccount}
                  variant="link"
                  className="px-1 py-0 h-auto"
                >
                  Add your first account
                </Button>
              )}{" "}
              to start tracking your finances!
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {accounts.map((account) => (
                <li
                  key={account.id}
                  className="py-4 hover:bg-muted/50 rounded-md px-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {getAccountTypeIcon(account.account_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-md font-medium">
                            {account.name}
                          </h3>
                          {account.is_default && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {account.institution || "No institution"} •{" "}
                          {account.account_number
                            ? `****${account.account_number}`
                            : "No account number"}
                        </p>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {account.account_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-semibold ${
                          account.account_type === "credit"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {formatCurrency(account.current_balance, {
                          currency: account.currency,
                        })}
                      </div>
                      <div className="flex mt-2 space-x-1">
                        {!account.is_default && (
                          <Button
                            onClick={() => handleSetDefault(account.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Set as default"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => onEdit(account)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(account.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bank account? This action
              cannot be undone. Any transactions associated with this account
              will remain but will no longer be linked to an account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
