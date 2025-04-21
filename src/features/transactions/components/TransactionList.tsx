import { useState, useEffect } from "react";
import {
  getRecentTransactions,
  getTransactionsByDateRange,
  deleteTransaction,
  Transaction as TransactionType,
} from "../../../api/supabase/transactions";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { TransactionModal } from "./TransactionModal";
import {
  TransactionFilters,
  TransactionFilters as FilterType,
} from "./TransactionFilters";
import { Edit, Trash2, Plus } from "lucide-react";

interface TransactionListProps {
  limit?: number;
  showFilters?: boolean;
  showAddButton?: boolean;
  onTransactionClick?: (transaction: TransactionType) => void;
  className?: string;
}

export function TransactionList({
  limit = 10,
  showFilters = false,
  showAddButton = false,
  onTransactionClick,
  className = "",
}: TransactionListProps = {}) {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterType>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    TransactionType | undefined
  >(undefined);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

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

  // Handle opening the add/edit modal
  const handleAddTransaction = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: TransactionType) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
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

  // Handle transaction refresh after add/edit
  const handleTransactionSuccess = () => {
    // Refetch transactions with current filters
    const currentFilters = { ...filters };
    setFilters({ ...currentFilters });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>;
  }

  if (transactions.length === 0 && !showAddButton) {
    return (
      <div className="p-4 text-center text-gray-500">
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
          <button
            onClick={handleAddTransaction}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Transaction
          </button>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="mb-4">
              No transactions found. Add your first transaction to get started!
            </p>
            {showAddButton && (
              <button
                onClick={handleAddTransaction}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Add Transaction
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li
                key={transaction.id}
                className="py-4 px-4 flex items-center hover:bg-gray-50"
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
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.description || "Unnamed transaction"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {formatDate(transaction.date, "short")} •{" "}
                    {transaction.category_name || "Uncategorized"}
                  </p>
                </div>
                <div
                  className={`text-sm font-medium mr-4 ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => handleEditTransaction(transaction)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    aria-label="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(transaction.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
        onSuccess={handleTransactionSuccess}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
