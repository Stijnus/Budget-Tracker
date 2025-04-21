import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  GoalWithCategory,
  getGoals,
  deleteGoal,
  calculateGoalMetrics,
} from "../../../api/supabase/goals";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { GoalModal } from "./GoalModal";

interface GoalsListProps {
  showAddButton?: boolean;
  className?: string;
}

export function GoalsList({
  showAddButton = false,
  className = "",
}: GoalsListProps) {
  const [goals, setGoals] = useState<GoalWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithCategory | undefined>(
    undefined
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  // Fetch goals
  useEffect(() => {
    async function fetchGoals() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getGoals();

        if (error) {
          throw error;
        }

        setGoals(data || []);
      } catch (err) {
        console.error("Error fetching goals:", err);
        setError("Failed to load goals");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGoals();
  }, []);

  // Handle opening the add/edit modal
  const handleAddGoal = () => {
    setSelectedGoal(undefined);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal: GoalWithCategory) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  // Handle goal deletion
  const handleDeleteClick = (id: string) => {
    setGoalToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!goalToDelete) return;

    try {
      const { error } = await deleteGoal(goalToDelete);
      if (error) throw error;

      // Remove from local state
      setGoals(goals.filter((g) => g.id !== goalToDelete));
      setIsDeleteConfirmOpen(false);
      setGoalToDelete(null);
    } catch (err) {
      console.error("Error deleting goal:", err);
      setError("Failed to delete goal");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    setGoalToDelete(null);
  };

  // Handle goal refresh after add/edit
  const handleGoalSuccess = () => {
    // Refetch goals
    async function fetchGoals() {
      try {
        const { data, error } = await getGoals();
        if (error) throw error;
        setGoals(data || []);
      } catch (err) {
        console.error("Error fetching goals:", err);
      }
    }

    fetchGoals();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "achieved":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "achieved":
        return "Achieved";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Add Goal Button */}
      {showAddButton && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleAddGoal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Goal
          </button>
        </div>
      )}

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {goals.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="mb-4">
              No financial goals found. Add your first goal to start tracking!
            </p>
            {showAddButton && (
              <button
                onClick={handleAddGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Add Goal
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {goals.map((goal) => {
              const metrics = calculateGoalMetrics(goal);
              return (
                <li key={goal.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-md font-medium text-gray-900">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {goal.category_name
                          ? goal.category_name
                          : "Uncategorized"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        aria-label="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(goal.id)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <Target size={16} className="text-gray-500 mr-1" />
                      <span className="text-gray-700">
                        {formatCurrency(goal.target_amount)}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        goal.status
                      )}`}
                    >
                      {getStatusText(goal.status)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${metrics.percentComplete}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>
                      {formatCurrency(goal.current_amount)} of{" "}
                      {formatCurrency(goal.target_amount)}
                    </span>
                    <span>{metrics.percentComplete}% complete</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      {goal.target_date
                        ? `Target: ${formatDate(goal.target_date, "medium")}`
                        : "No target date"}
                    </span>
                  </div>

                  {/* Show remaining amount and daily target if applicable */}
                  {goal.status === "in_progress" && (
                    <div className="mt-2 flex flex-col text-xs text-gray-500">
                      <div className="flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        <span>
                          {formatCurrency(metrics.amountRemaining)} remaining
                        </span>
                      </div>
                      {goal.target_date && metrics.dailyTarget > 0 && (
                        <div className="flex items-center mt-1">
                          <TrendingUp size={14} className="mr-1" />
                          <span>
                            Save {formatCurrency(metrics.dailyTarget)} daily to
                            reach goal
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goal={selectedGoal}
        onSuccess={handleGoalSuccess}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this goal? This action cannot be
              undone.
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
