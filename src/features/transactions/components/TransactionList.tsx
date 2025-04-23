import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRecentTransactions,
  getTransactionsByDateRange,
  deleteTransaction,
  Transaction as TransactionType,
} from "../../../api/supabase/transactions";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import {
  TransactionFilters,
  TransactionFilters as FilterType,
} from "./TransactionFilters";
import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TransactionListProps {
  limit?: number;
  showFilters?: boolean;
  showAddButton?: boolean;
  onTransactionClick?: (transaction: TransactionType) => void;
  className?: string;
  filters?: FilterType;
}

export function TransactionList({
  limit = 10,
  showFilters = false,
  showAddButton = false,
  onTransactionClick,
  className = "",
  filters: externalFilters,
}: TransactionListProps = {}) {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterType>(externalFilters || {});
  const navigate = useNavigate();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  // Update internal filters when external filters change
  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters);
    }
  }, [externalFilters]);

  // Fetch transactions when filters change
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        setError(null);

        let result;

        // Apply filters if they exist
        if (filters.startDate && filters.endDate) {
          result = await getTransactionsByDateRange(
            filters.startDate,
            filters.endDate
          );
        } else {
          result = await getRecentTransactions(limit);
        }

        if (result.error) {
          throw new Error(result.error.message);
        }

        let filteredData = result.data || [];

        // Apply client-side filters
        if (filters.type && filters.type !== "all") {
          filteredData = filteredData.filter((t) => t.type === filters.type);
        }

        if (filters.categoryId) {
          filteredData = filteredData.filter(
            (t) => t.category_id === filters.categoryId
          );
        }

        if (filters.bankAccountId) {
          filteredData = filteredData.filter(
            (t) => t.bank_account_id === filters.bankAccountId
          );
        }

        if (filters.minAmount !== undefined) {
          filteredData = filteredData.filter(
            (t) => t.amount >= filters.minAmount!
          );
        }

        if (filters.maxAmount !== undefined) {
          filteredData = filteredData.filter(
            (t) => t.amount <= filters.maxAmount!
          );
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredData = filteredData.filter(
            (t) =>
              t.description?.toLowerCase().includes(query) ||
              t.category_name?.toLowerCase().includes(query) ||
              t.payment_method?.toLowerCase().includes(query) ||
              t.notes?.toLowerCase().includes(query)
          );
        }

        // Cast to TransactionType[] to ensure type compatibility
        setTransactions(filteredData as TransactionType[]);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [filters, limit]);

  // Handle navigation to add/edit transaction page
  const handleAddTransaction = () => {
    navigate("/transactions/new");
  };

  const handleEditTransaction = (transaction: TransactionType) => {
    navigate(`/transactions/${transaction.id}`);
  };

  // Handle transaction deletion
  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      const { error } = await deleteTransaction(transactionToDelete);
      if (error) throw error;

      // Remove from local state
      setTransactions(transactions.filter((t) => t.id !== transactionToDelete));
      setIsDeleteConfirmOpen(false);
      setTransactionToDelete(null);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Failed to delete transaction");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    setTransactionToDelete(null);
  };

  // Note: Transaction refresh is now handled by navigation and useEffect

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 dark:bg-destructive/20 rounded-md">
        {error}
      </div>
    );
  }

  if (transactions.length === 0 && !showAddButton) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="mb-4">
          No transactions found. Add your first transaction to get started!
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Filters */}
      {showFilters && (
        <TransactionFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Add Transaction Button */}
      {showAddButton && (
        <div className="mb-4 flex justify-end">
          <Button
            onClick={handleAddTransaction}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p className="mb-4">
              No transactions found. Add your first transaction to get started!
            </p>
            {showAddButton && (
              <Button
                onClick={handleAddTransaction}
                className="flex items-center gap-1"
              >
                <Plus size={16} />
                Add Transaction
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((transaction) => (
              <li
                key={transaction.id}
                className="py-4 px-4 flex items-center hover:bg-accent/50"
              >
                <div
                  className="w-2 h-10 rounded-full mr-4"
                  style={{
                    backgroundColor: transaction.category_color || "#CBD5E0",
                  }}
                />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() =>
                    onTransactionClick
                      ? onTransactionClick(transaction)
                      : handleEditTransaction(transaction)
                  }
                >
                  <p className="text-sm font-medium text-foreground truncate">
                    {transaction.description || "Unnamed transaction"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {formatDate(transaction.date, "short")} •{" "}
                    {transaction.category_name || "Uncategorized"}
                    {transaction.bank_account_name && (
                      <>
                        {" "}
                        •{" "}
                        <span className="text-primary/70">
                          {transaction.bank_account_name}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div
                  className={`text-sm font-medium mr-4 ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2 ml-2">
                  <Button
                    onClick={() => handleEditTransaction(transaction)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Edit"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(transaction.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
