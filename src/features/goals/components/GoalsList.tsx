import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash2,
  Plus,
  Target,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  GoalWithCategory,
  getGoals,
  deleteGoal,
  calculateGoalMetrics,
} from "../../../api/supabase/goals";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface GoalsListProps {
  showAddButton?: boolean;
  className?: string;
}

export function GoalsList({
  showAddButton = false,
  className = "",
}: GoalsListProps) {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<GoalWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Using page-based navigation instead of modals
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

  // Navigate to add/edit pages
  const handleAddGoal = () => {
    navigate("/goals/new");
  };

  const handleEditGoal = (goal: GoalWithCategory) => {
    navigate(`/goals/${goal.id}`);
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

      // Refresh goals after deletion
      await refreshGoals();
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

  // Refresh goals after delete
  const refreshGoals = async () => {
    try {
      const { data, error } = await getGoals();
      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error("Error fetching goals:", err);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "achieved":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
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
    <div className={`${className}`}>
      {/* Add Goal Button */}
      {showAddButton && (
        <div className="mb-4 flex justify-end">
          <Button onClick={handleAddGoal} size="sm">
            <Plus size={16} className="mr-1" />
            Add Goal
          </Button>
        </div>
      )}

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p className="mb-4">
                No financial goals found. Add your first goal to start tracking!
              </p>
              {showAddButton && (
                <Button onClick={handleAddGoal}>Add Goal</Button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {goals.map((goal) => {
                const metrics = calculateGoalMetrics(goal);
                return (
                  <li
                    key={goal.id}
                    className="p-4 hover:bg-muted/50 rounded-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-md font-medium">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {goal.category_name
                            ? goal.category_name
                            : "Uncategorized"}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => handleEditGoal(goal)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(goal.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <Target
                          size={16}
                          className="text-muted-foreground mr-1"
                        />
                        <span>{formatCurrency(goal.target_amount)}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(goal.status)}
                      >
                        {getStatusText(goal.status)}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <Progress
                      value={metrics.percentComplete}
                      className="h-2 mb-2"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>
                        {formatCurrency(goal.current_amount)} of{" "}
                        {formatCurrency(goal.target_amount)}
                      </span>
                      <span>{metrics.percentComplete}% complete</span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar size={14} className="mr-1" />
                      <span>
                        {goal.target_date
                          ? `Target: ${formatDate(goal.target_date, "medium")}`
                          : "No target date"}
                      </span>
                    </div>

                    {/* Show remaining amount and daily target if applicable */}
                    {goal.status === "in_progress" && (
                      <div className="mt-2 flex flex-col text-xs text-muted-foreground">
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
                              Save {formatCurrency(metrics.dailyTarget)} daily
                              to reach goal
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
        </CardContent>
      </Card>

      {/* No modal needed - using page-based navigation */}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => !open && handleDeleteCancel()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this goal? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
