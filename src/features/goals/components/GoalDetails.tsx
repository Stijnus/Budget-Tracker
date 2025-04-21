import { useState, useEffect } from "react";
import {
  Target,
  Calendar,
  DollarSign,
  Tag,
  TrendingUp,
  Edit,
  PlusCircle,
  X,
} from "lucide-react";
import {
  GoalWithCategory,
  getGoalById,
  calculateGoalMetrics,
  addGoalContribution,
} from "../../../api/supabase/goals";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { GoalModal } from "./GoalModal";
import { ContributionHistory } from "./ContributionHistory";

interface GoalDetailsProps {
  goalId: string;
}

export function GoalDetails({ goalId }: GoalDetailsProps) {
  const [goal, setGoal] = useState<GoalWithCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionNotes, setContributionNotes] = useState("");
  const [metrics, setMetrics] = useState<ReturnType<
    typeof calculateGoalMetrics
  > | null>(null);

  useEffect(() => {
    async function fetchGoalDetails() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getGoalById(goalId);

        if (error) {
          throw error;
        }

        setGoal(data);
        if (data) {
          setMetrics(calculateGoalMetrics(data));
        }
      } catch (err) {
        console.error("Error fetching goal details:", err);
        setError("Failed to load goal details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGoalDetails();
  }, [goalId]);

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!goal) return;

    try {
      const amount = parseFloat(contributionAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid contribution amount");
        return;
      }

      const { error } = await addGoalContribution(
        goal.id,
        amount,
        new Date(),
        contributionNotes || undefined
      );

      if (error) throw error;

      // Refresh goal details
      const { data: updatedGoal } = await getGoalById(goal.id);
      setGoal(updatedGoal);
      if (updatedGoal) {
        setMetrics(calculateGoalMetrics(updatedGoal));
      }

      // Reset form
      setContributionAmount("");
      setContributionNotes("");
      setIsContributeModalOpen(false);
    } catch (err) {
      console.error("Error adding contribution:", err);
      setError("Failed to add contribution");
    }
  };

  const handleGoalUpdate = async () => {
    // Refresh goal details
    const { data, error } = await getGoalById(goalId);
    if (error) {
      console.error("Error refreshing goal details:", error);
      return;
    }

    setGoal(data);
    if (data) {
      setMetrics(calculateGoalMetrics(data));
    }
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
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>;
  }

  if (!goal || !metrics) {
    return <div className="p-4 text-gray-500">Goal not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-gray-800">{goal.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="Edit"
          >
            <Edit size={18} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-blue-600 h-4 rounded-full"
          style={{ width: `${metrics.percentComplete}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-sm text-gray-700 mb-6">
        <span>
          {formatCurrency(goal.current_amount)} of{" "}
          {formatCurrency(goal.target_amount)}
        </span>
        <span className="font-medium">{metrics.percentComplete}% complete</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center mb-4">
            <Target size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Target Amount</p>
              <p className="text-lg font-medium">
                {formatCurrency(goal.target_amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Calendar size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">
                {formatDate(goal.start_date, "medium")}
              </p>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Calendar size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Target Date</p>
              <p className="font-medium">
                {goal.target_date
                  ? formatDate(goal.target_date, "medium")
                  : "No target date"}

                {goal.target_date && metrics.isOverdue && (
                  <span className="ml-2 text-xs text-red-600 font-normal">
                    Overdue
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <Tag size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">
                {goal.category_name || "Uncategorized"}
              </p>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <DollarSign size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Amount Remaining</p>
              <p className="font-medium">
                {formatCurrency(metrics.amountRemaining)}
              </p>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <div className="w-[18px] h-[18px] flex items-center justify-center text-gray-500 mr-2">
              <span className="text-sm font-bold">%</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  goal.status
                )}`}
              >
                {getStatusText(goal.status)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily/Monthly targets */}
      {goal.status === "in_progress" && goal.target_date && (
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Saving Targets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <TrendingUp size={16} className="text-blue-600 mr-2" />
              <div>
                <p className="text-xs text-blue-600">Daily Target</p>
                <p className="text-sm font-medium text-blue-800">
                  {formatCurrency(metrics.dailyTarget)}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <TrendingUp size={16} className="text-blue-600 mr-2" />
              <div>
                <p className="text-xs text-blue-600">Monthly Target</p>
                <p className="text-sm font-medium text-blue-800">
                  {formatCurrency(metrics.monthlyTarget)}
                </p>
              </div>
            </div>
          </div>
          {metrics.timeRemainingDays > 0 && (
            <p className="text-xs text-blue-600 mt-2">
              {metrics.timeRemainingDays} days remaining to reach your goal
            </p>
          )}
        </div>
      )}

      {goal.notes && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
          <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
            {goal.notes}
          </p>
        </div>
      )}

      {goal.status === "in_progress" && (
        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => setIsContributeModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={16} className="mr-1" />
            Add Contribution
          </button>
        </div>
      )}

      <ContributionHistory goalId={goal.id} className="mt-6" />

      {/* Edit Modal */}
      <GoalModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        goal={goal}
        onSuccess={handleGoalUpdate}
      />

      {/* Add Contribution Modal */}
      {isContributeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Contribution
              </h3>
              <button
                onClick={() => setIsContributeModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddContribution} className="space-y-4">
              <div>
                <label
                  htmlFor="contributionAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    id="contributionAmount"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contributionNotes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="contributionNotes"
                  value={contributionNotes}
                  onChange={(e) => setContributionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
