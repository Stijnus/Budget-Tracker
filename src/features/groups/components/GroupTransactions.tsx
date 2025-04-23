import { useState } from "react";
// Translation imports removed
import { useAuth } from "../../../state/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { GroupTransactionForm } from "./GroupTransactionForm";
import {
  deleteGroupTransaction,
  type GroupTransaction as ApiGroupTransaction,
} from "../../../api/supabase/groupTransactions";

// Define the transaction interface
// Extend the API type for our component
type GroupTransaction = ApiGroupTransaction & {
  category?: {
    id: string;
    name: string;
    color: string;
    type?: string;
  } | null;
  creator?: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
};

interface GroupTransactionsProps {
  groupId: string;
  transactions: GroupTransaction[];
  userRole: string;
  onChange: () => void;
}

export function GroupTransactions({
  groupId,
  transactions,
  userRole,
  onChange,
}: GroupTransactionsProps) {
  // Translation hooks removed
  const { user } = useAuth();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<GroupTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreateTransaction =
    userRole === "owner" || userRole === "admin" || userRole === "member";
  const canEditTransaction = (transaction: GroupTransaction) => {
    return (
      userRole === "owner" ||
      userRole === "admin" ||
      transaction.created_by === user?.id
    );
  };

  const handleOpenForm = (transaction?: GroupTransaction) => {
    setSelectedTransaction(transaction || null);
    setIsFormDialogOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await deleteGroupTransaction(selectedTransaction.id);

      if (error) {
        console.error("Error from API when deleting transaction:", error);
        throw error;
      }

      onChange();
      setIsDeleteDialogOpen(false);
      setSelectedTransaction(null);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Failed to delete transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transactions</h2>
        {canCreateTransaction && (
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No transactions found
              </p>
              {canCreateTransaction && (
                <Button onClick={() => handleOpenForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === "expense" ? (
                          <ArrowDownCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <ArrowUpCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span>
                          {transaction.description || "No description"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.category ? (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: transaction.category.color
                              ? `${transaction.category.color}20`
                              : undefined,
                            color: transaction.category.color,
                            borderColor: transaction.category.color,
                          }}
                        >
                          {transaction.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          Uncategorized
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === "expense"
                          ? "text-destructive"
                          : "text-green-500"
                      }
                    >
                      {transaction.type === "expense" ? "-" : "+"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          {transaction.creator?.user_profiles?.avatar_url && (
                            <AvatarImage
                              src={transaction.creator.user_profiles.avatar_url}
                              alt={
                                transaction.creator?.user_profiles?.full_name ||
                                transaction.creator?.id ||
                                ""
                              }
                            />
                          )}
                          <AvatarFallback>
                            {(
                              transaction.creator?.user_profiles?.full_name ||
                              transaction.creator?.id ||
                              ""
                            )
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[100px]">
                          {transaction.creator?.user_profiles?.full_name ||
                            transaction.creator?.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {canEditTransaction(transaction) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenForm(transaction)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTransaction ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
          </DialogHeader>
          <GroupTransactionForm
            groupId={groupId}
            transaction={selectedTransaction || undefined}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              onChange();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTransaction}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
