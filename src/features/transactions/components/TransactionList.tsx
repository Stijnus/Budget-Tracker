import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRecentTransactions,
  getTransactionsByDateRange,
  deleteTransaction,
  Transaction as TransactionType,
} from "../../../api/supabase/transactions";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionDialog } from "./TransactionDialog";
import type { TransactionType as FilterTransactionType } from "./TransactionFilters";
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

interface TransactionListFilters {
  type?: FilterTransactionType;
  categoryId?: string;
  bankAccountId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

interface TransactionListProps {
  limit?: number;
  showFilters?: boolean;
  showAddButton?: boolean;
  showPagination?: boolean;
  compact?: boolean;
  onTransactionClick?: (transaction: TransactionType) => void;
  className?: string;
  filters?: TransactionListFilters;
}

export function TransactionList({
  limit: initialLimit = 10,
  showFilters = false,
  showAddButton = false,
  showPagination = true,
  compact = false,
  onTransactionClick,
  className = "",
  filters: externalFilters,
}: TransactionListProps = {}) {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionListFilters>(
    externalFilters || {}
  );
  const [limit, setLimit] = useState(initialLimit);
  const navigate = useNavigate();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionType | null>(null);

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

        // Apply client-side filters
        const filteredData = (result.data || []).filter((transaction) => {
          // Skip any filter that doesn't have a value
          if (filters.type && filters.type !== "all") {
            if (transaction.type !== filters.type.toLowerCase()) return false;
          }

          if (filters.categoryId) {
            if (transaction.category_id !== filters.categoryId) return false;
          }

          if (filters.bankAccountId) {
            if (transaction.bank_account_id !== filters.bankAccountId)
              return false;
          }

          if (filters.minAmount !== undefined) {
            if (transaction.amount < filters.minAmount) return false;
          }

          if (filters.maxAmount !== undefined) {
            if (transaction.amount > filters.maxAmount) return false;
          }

          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matchesSearch =
              transaction.description?.toLowerCase().includes(query) ||
              transaction.category_name?.toLowerCase().includes(query) ||
              transaction.payment_method?.toLowerCase().includes(query) ||
              transaction.notes?.toLowerCase().includes(query);

            if (!matchesSearch) return false;
          }

          return true;
        });

        setTransactions(filteredData);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [filters, limit]);

  // Handle opening the transaction dialog
  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsDialogOpen(true);
  };

  const handleEditTransaction = (transaction: TransactionType) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
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

  // Handle filter changes
  const handleFilterChange = (newFilters: TransactionListFilters) => {
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
    <div className={`space-y-4 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <TransactionFilters
          type={filters.type}
          categoryId={filters.categoryId}
          bankAccountId={filters.bankAccountId}
          startDate={filters.startDate}
          endDate={filters.endDate}
          minAmount={filters.minAmount}
          maxAmount={filters.maxAmount}
          searchQuery={filters.searchQuery}
          onChange={handleFilterChange}
        />
      )}

      {/* Add Transaction Button */}
      {showAddButton && (
        <div className="flex justify-end mb-4">
          <Button onClick={handleAddTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      )}

      {/* Transactions List */}
      <div className={`space-y-2 ${compact ? "text-sm" : ""}`}>
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`flex items-center justify-between p-3 bg-card hover:bg-accent/50 rounded-lg cursor-pointer ${
              compact ? "py-2" : "py-4"
            }`}
            onClick={() =>
              onTransactionClick
                ? onTransactionClick(transaction)
                : handleEditTransaction(transaction)
            }
          >
            {/* Transaction details */}
            <div className="flex items-center space-x-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  transaction.type === "expense" ? "bg-red-500" : "bg-green-500"
                }`}
              />
              <div>
                <div className="font-medium">
                  {transaction.description || "No description"}
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatDate(transaction.date)}
                  {transaction.category_name && <span className="mx-1">•</span>}
                  {transaction.category_name}
                </div>
              </div>
            </div>

            {/* Amount and Actions */}
            <div className="flex items-center space-x-4">
              <span
                className={`font-medium ${
                  transaction.type === "expense"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {transaction.type === "expense" ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </span>

              {!compact && (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTransaction(transaction);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(transaction.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination - if needed */}
      {showPagination && transactions.length >= limit && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => setLimit(limit + 10)}>
            Load More
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transaction Dialog */}
      <TransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        transaction={selectedTransaction || undefined}
        onSuccess={() => {
          setIsDialogOpen(false);
          setSelectedTransaction(null);
          // Refresh the transaction list
          const newFilters = { ...filters };
          setFilters(newFilters);
        }}
      />
    </div>
  );
}
