import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBankAccountById,
  deleteBankAccount,
  BankAccount,
} from "../../../api/supabase/bankAccounts";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { showItemDeletedToast, showErrorToast } from "../../../utils/toast";
import {
  Edit,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  HelpCircle,
  Star,
  Calendar,
  Clock,
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
import { Separator } from "@/components/ui/separator";
import { TransactionList } from "../../transactions/components/TransactionList";

interface BankAccountDetailsProps {
  accountId?: string;
  onEdit?: (account: BankAccount) => void;
  onDelete?: () => void;
  showBackButton?: boolean;
}

export function BankAccountDetails({
  accountId,
  onEdit,
  onDelete,
  showBackButton = true,
}: BankAccountDetailsProps) {
  const params = useParams();
  const navigate = useNavigate();
  const id = accountId || params.id;

  const [account, setAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Load account details
  useEffect(() => {
    const loadAccount = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await getBankAccountById(id);
        if (error) throw error;

        setAccount(data);
      } catch (err) {
        console.error("Error loading bank account:", err);
        setError("Failed to load bank account details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAccount();
  }, [id]);

  // Handle account deletion
  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      const { error } = await deleteBankAccount(id);
      if (error) throw error;

      // Show success toast
      showItemDeletedToast("bank account");

      // Navigate back or call onDelete
      if (onDelete) {
        onDelete();
      } else {
        navigate("/accounts");
      }
    } catch (err) {
      console.error("Error deleting bank account:", err);
      showErrorToast("Failed to delete bank account");
    } finally {
      setIsDeleteConfirmOpen(false);
    }
  };

  // Handle edit button click
  const handleEditClick = () => {
    if (!account) return;

    if (onEdit) {
      onEdit(account);
    } else {
      navigate(`/accounts/${id}/edit`);
    }
  };

  // Get icon for account type
  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <Wallet className="h-5 w-5" />;
      case "savings":
        return <PiggyBank className="h-5 w-5" />;
      case "credit":
        return <CreditCard className="h-5 w-5" />;
      case "investment":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Bank account not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      {showBackButton && (
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/accounts")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Accounts
        </Button>
      )}

      {/* Account Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              {getAccountTypeIcon(account.account_type)}
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {account.name}
                {account.is_default && (
                  <Badge variant="outline" className="ml-2">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    Default
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {account.institution || "No institution"} •{" "}
                {account.account_number
                  ? `****${account.account_number}`
                  : "No account number"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleEditClick} size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button onClick={handleDeleteClick} size="sm" variant="destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Balance */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">
                    Current Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <p className="text-2xl font-bold">
                    {formatCurrency(account.current_balance, {
                      currency: account.currency,
                    })}
                  </p>
                </CardContent>
              </Card>

              {/* Account Type */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">
                    Account Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <Badge
                    variant="outline"
                    className="text-md capitalize font-normal"
                  >
                    {account.account_type}
                  </Badge>
                </CardContent>
              </Card>

              {/* Last Updated */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{formatDate(account.last_updated)}</span>
                </CardContent>
              </Card>
            </div>

            {/* Additional Details */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Additional Details</h3>
              <Separator className="mb-4" />
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Currency</dt>
                  <dd>{account.currency}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Created On</dt>
                  <dd className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(account.created_at)}
                  </dd>
                </div>
                {account.notes && (
                  <div className="col-span-2 mt-2">
                    <dt className="text-sm text-muted-foreground">Notes</dt>
                    <dd className="mt-1 whitespace-pre-wrap">
                      {account.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <Button
              variant="link"
              onClick={() => navigate(`/transactions?account=${id}`)}
              className="h-8 px-2"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionList
            filters={{ bankAccountId: id }}
            showPagination={false}
            compact={true}
            limit={5}
          />
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
