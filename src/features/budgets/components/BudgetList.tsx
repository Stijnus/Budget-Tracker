import { useState, useEffect } from "react";
import { 
  getBudgets, 
  deleteBudget,
  Budget 
} from "../../../api/supabase/budgets";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { BudgetModal } from "./BudgetModal";
import { Edit, Trash2, Plus, AlertCircle } from "lucide-react";

interface BudgetListProps {
  showAddButton?: boolean;
  className?: string;
}

export function BudgetList({ 
  showAddButton = false,
  className = "" 
}: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  // Fetch budgets
  useEffect(() => {
    async function fetchBudgets() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await getBudgets();
        
        if (error) {
          throw error;
        }
        
        setBudgets(data || []);
      } catch (err) {
        console.error("Error fetching budgets:", err);
        setError("Failed to load budgets");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBudgets();
  }, []);

  // Handle opening the add/edit modal
  const handleAddBudget = () => {
    setSelectedBudget(undefined);
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  // Handle budget deletion
  const handleDeleteClick = (id: string) => {
    setBudgetToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;

    try {
      const { error } = await deleteBudget(budgetToDelete);
      if (error) throw error;

      // Remove from local state
      setBudgets(budgets.filter(b => b.id !== budgetToDelete));
      setIsDeleteConfirmOpen(false);
      setBudgetToDelete(null);
    } catch (err) {
      console.error('Error deleting budget:', err);
      setError('Failed to delete budget');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    setBudgetToDelete(null);
  };

  // Handle budget refresh after add/edit
  const handleBudgetSuccess = () => {
    // Refetch budgets
    async function fetchBudgets() {
      try {
        const { data, error } = await getBudgets();
        if (error) throw error;
        setBudgets(data || []);
      } catch (err) {
        console.error("Error fetching budgets:", err);
      }
    }

    fetchBudgets();
  };

  // Calculate budget progress
  const calculateProgress = (budget: Budget) => {
    if (!budget.spent) return 0;
    return Math.min(100, (budget.spent / budget.amount) * 100);
  };

  // Determine progress color
  const getProgressColor = (budget: Budget) => {
    const progress = calculateProgress(budget);
    if (progress >= 100) return "bg-red-500";
    if (progress >= 75) return "bg-yellow-500";
    return "bg-blue-500";
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

  return (
    <div className={`${className}`}>
      {/* Add Budget Button */}
      {showAddButton && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleAddBudget}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Budget
          </button>
        </div>
      )}

      {/* Budgets List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {budgets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No budgets found. {showAddButton && (
              <button 
                onClick={handleAddBudget}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Create your first budget
              </button>
            )} to start tracking your spending!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {budgets.map((budget) => (
              <li 
                key={budget.id} 
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{budget.name}</h3>
                    <p className="text-sm text-gray-500">
                      {budget.category_name ? budget.category_name : "All Categories"} • 
                      {budget.period === "monthly" ? " Monthly" : 
                       budget.period === "yearly" ? " Yearly" : " Custom"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditBudget(budget)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(budget.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(budget.spent || 0)} of {formatCurrency(budget.amount)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(budget.start_date, "short")} - {budget.end_date ? formatDate(budget.end_date, "short") : "Ongoing"}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(budget)}`}
                    style={{ width: `${calculateProgress(budget)}%` }}
                  ></div>
                </div>
                
                {/* Alert if over budget */}
                {budget.spent && budget.spent > budget.amount && (
                  <div className="mt-2 flex items-center text-xs text-red-600">
                    <AlertCircle size={14} className="mr-1" />
                    Over budget by {formatCurrency(budget.spent - budget.amount)}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budget={selectedBudget}
        onSuccess={handleBudgetSuccess}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this budget? This action cannot be undone.</p>
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
