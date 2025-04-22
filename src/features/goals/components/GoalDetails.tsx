import { useState, useEffect } from "react";
import {
  Target,
  Calendar,
  DollarSign,
  Tag,
  TrendingUp,
  Edit,
  PlusCircle,
  AlertCircle,
  Loader2,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

  if (!goal || !metrics) {
    return <div className="p-4 text-muted-foreground">Goal not found</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">{goal.name}</CardTitle>
        <Button
          onClick={() => setIsEditModalOpen(true)}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Edit size={18} />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <Progress
          value={metrics.percentComplete}
          className="h-4 mb-4"
        />

        <div className="flex justify-between text-sm mb-6">
          <span>
            {formatCurrency(goal.current_amount)} of{" "}
            {formatCurrency(goal.target_amount)}
          </span>
          <span className="font-medium">{metrics.percentComplete}% complete</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex items-center mb-4">
              <Target size={18} className="text-muted-foreground mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Target Amount</p>
                <p className="text-lg font-medium">
                  {formatCurrency(goal.target_amount)}
                </p>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <Calendar size={18} className="text-muted-foreground mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {formatDate(goal.start_date, "medium")}
                </p>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <Calendar size={18} className="text-muted-foreground mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Target Date</p>
                <p className="font-medium">
                  {goal.target_date
                    ? formatDate(goal.target_date, "medium")
                    : "No target date"}

                  {goal.target_date && metrics.isOverdue && (
                    <Badge variant="destructive" className="ml-2 text-xs font-normal">
                      Overdue
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <Tag size={18} className="text-muted-foreground mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">
                  {goal.category_name || "Uncategorized"}
                </p>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <DollarSign size={18} className="text-muted-foreground mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Amount Remaining</p>
                <p className="font-medium">
                  {formatCurrency(metrics.amountRemaining)}
                </p>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <div className="w-[18px] h-[18px] flex items-center justify-center text-muted-foreground mr-2">
                <span className="text-sm font-bold">%</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className={getStatusColor(goal.status)}
                >
                  {getStatusText(goal.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Daily/Monthly targets */}
        {goal.status === "in_progress" && goal.target_date && (
          <Card className="bg-primary/5 mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Saving Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <TrendingUp size={16} className="text-primary mr-2" />
                  <div>
                    <p className="text-xs text-muted-foreground">Daily Target</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(metrics.dailyTarget)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <TrendingUp size={16} className="text-primary mr-2" />
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Target</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(metrics.monthlyTarget)}
                    </p>
                  </div>
                </div>
              </div>
              {metrics.timeRemainingDays > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {metrics.timeRemainingDays} days remaining to reach your goal
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {goal.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Notes</h3>
            <p className="text-muted-foreground bg-muted p-3 rounded-md">
              {goal.notes}
            </p>
          </div>
        )}

        {goal.status === "in_progress" && (
          <div className="flex space-x-3 mb-6">
            <Button
              onClick={() => setIsContributeModalOpen(true)}
              className="flex items-center"
            >
              <PlusCircle size={16} className="mr-1" />
              Add Contribution
            </Button>
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
        <Dialog 
          open={isContributeModalOpen} 
          onOpenChange={(open) => !open && setIsContributeModalOpen(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Contribution</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddContribution} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contributionAmount">Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    id="contributionAmount"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="pl-8"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributionNotes">Notes</Label>
                <Textarea
                  id="contributionNotes"
                  value={contributionNotes}
                  onChange={(e) => setContributionNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsContributeModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Contribution
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
