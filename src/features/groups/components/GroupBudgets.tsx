import { useState } from "react";
// Translation imports removed
import { useAuth } from "../../../state/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, MoreHorizontal, Edit, Trash2, Calendar, PiggyBank } from "lucide-react";
import { GroupBudgetForm } from "./GroupBudgetForm";
import {
  deleteGroupBudget,
  calculateGroupBudgetProgress,

} from "../../../api/supabase/groupBudgets";

// Use the canonical GroupBudget type from the API
import type { GroupBudget } from "../../../api/supabase/groupBudgets";

interface BudgetProgress {
  budgetAmount: number;
  spentAmount: number;
  progressPercentage: number;
  isOverBudget: boolean;
}

interface GroupBudgetsProps {
  groupId: string;
  budgets: GroupBudget[];
  userRole: string;
  onChange: () => void;
  compact?: boolean;
}
// No local extension of GroupBudget needed; use as-is from API

export function GroupBudgets({
  groupId,
  budgets,
  userRole,
  onChange,
  compact = false,
}: GroupBudgetsProps) {
  // Translation hooks removed
  const { user } = useAuth();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<GroupBudget | null>(
    null
  );
  const [budgetProgress, setBudgetProgress] = useState<
    Record<string, BudgetProgress>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newBudgetName, setNewBudgetName] = useState<string | null>(null);

  const canCreateBudget =
    userRole === "owner" || userRole === "admin" || userRole === "member";
  const canEditBudget = (budget: GroupBudget) => {
    return (
      userRole === "owner" ||
      userRole === "admin" ||
      budget.created_by === user?.id
    );
  };

  const handleOpenForm = (budget?: GroupBudget) => {
    setSelectedBudget(budget || null);
    setIsFormDialogOpen(true);
  };

  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await deleteGroupBudget(selectedBudget.id);

      if (error) throw error;

      onChange();
      setIsDeleteDialogOpen(false);
      setSelectedBudget(null);
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError("Failed to delete budget. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBudgetProgress = async (budgetId: string) => {
    try {
      const { data, error } = await calculateGroupBudgetProgress(budgetId);

      if (error) throw error;

      setBudgetProgress((prev) => ({
        ...prev,
        [budgetId]: data,
      }));
    } catch (err) {
      console.error("Error calculating budget progress:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPeriod = (period: string) => {
    switch (period) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return period;
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

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Budgets</h2>
          {canCreateBudget && (
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription className="flex items-center space-x-2">
            <span>{successMessage}</span>
            {newBudgetName && (
              <Badge
                variant="outline"
                className="ml-2 bg-green-100 text-green-800 border-green-300"
              >
                {newBudgetName}
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {budgets.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <div className="rounded-full bg-amber-50 p-3">
                <PiggyBank className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-medium">No budgets found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-2">
                Create budgets to track and manage your group's spending in
                different categories.
              </p>
              {canCreateBudget && (
                <Button onClick={() => handleOpenForm()} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Budget
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            // Load budget progress if not already loaded
            if (!budgetProgress[budget.id]) {
              loadBudgetProgress(budget.id);
            }

            const progress = budgetProgress[budget.id];

            return (
              <Card key={budget.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{budget.name}</CardTitle>
                      <CardDescription>
                        {formatPeriod(budget.period)} •{" "}
                        {formatCurrency(budget.amount)}
                      </CardDescription>
                    </div>
                    {canEditBudget(budget) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenForm(budget)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBudget(budget);
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
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-4">
                    {budget.category_id && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Category: {budget.category_id}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>
                        {formatDate(budget.start_date)}
                        {budget.end_date && ` - ${formatDate(budget.end_date)}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        Created by: {budget.created_by}
                      </span>
                    </div>

                    {progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            {formatCurrency(progress.spentAmount)} /{" "}
                            {formatCurrency(progress.budgetAmount)}
                          </span>
                          <span
                            className={
                              progress.isOverBudget ? "text-destructive" : ""
                            }
                          >
                            {progress.progressPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div
                          className={
                            progress.isOverBudget
                              ? "bg-red-200 rounded-full"
                              : ""
                          }
                        >
                          <Progress
                            value={progress.progressPercentage}
                            className={
                              progress.isOverBudget ? "bg-transparent" : ""
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Budget Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedBudget ? "Edit Budget" : "Add Budget"}
            </DialogTitle>
          </DialogHeader>
          <GroupBudgetForm
            groupId={groupId}
            budget={selectedBudget || undefined}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              onChange();
              // Show success message
              if (!selectedBudget) {
                setSuccessMessage("Budget created successfully!");
                setNewBudgetName(budgets?.[0]?.name || null);
                // Clear success message after 5 seconds
                setTimeout(() => {
                  setSuccessMessage(null);
                  setNewBudgetName(null);
                }, 5000);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Budget Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the budget "{selectedBudget?.name}
              "? This action cannot be undone.
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
              onClick={handleDeleteBudget}
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
