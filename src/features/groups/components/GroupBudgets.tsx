import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react";
import { GroupBudgetForm } from "./GroupBudgetForm";
import {
  deleteGroupBudget,
  calculateGroupBudgetProgress,
  type GroupBudget as ApiGroupBudget,
} from "../../../api/supabase/groupBudgets";

// Use the API type and extend it for our component
type GroupBudget = ApiGroupBudget & {
  category?: {
    id: string;
    name: string;
    type: string;
    color?: string;
  } | null;
  creator?: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
};

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
}

export function GroupBudgets({
  groupId,
  budgets,
  userRole,
  onChange,
}: GroupBudgetsProps) {
  const { t } = useTranslation();
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
        return t("groups.daily");
      case "weekly":
        return t("groups.weekly");
      case "monthly":
        return t("groups.monthly");
      case "yearly":
        return t("groups.yearly");
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("groups.budgets")}</h2>
        {canCreateBudget && (
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            {t("groups.addBudget")}
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              {t("groups.noBudgets")}
            </p>
            {canCreateBudget && (
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" />
                {t("groups.addBudget")}
              </Button>
            )}
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
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBudget(budget);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-4">
                    {budget.category && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: budget.category.color
                              ? `${budget.category.color}20`
                              : undefined,
                            color: budget.category.color,
                            borderColor: budget.category.color,
                          }}
                        >
                          {budget.category.name}
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
                      <Avatar className="h-6 w-6">
                        {budget.creator?.user_profiles?.avatar_url && (
                          <AvatarImage
                            src={budget.creator.user_profiles.avatar_url}
                            alt={
                              budget.creator?.user_profiles?.full_name ||
                              budget.creator?.id ||
                              ""
                            }
                          />
                        )}
                        <AvatarFallback>
                          {(
                            budget.creator?.user_profiles?.full_name ||
                            budget.creator?.id ||
                            ""
                          )
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">
                        {t("groups.createdBy")}{" "}
                        {budget.creator?.user_profiles?.full_name ||
                          budget.creator?.id}
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
              {selectedBudget ? t("groups.editBudget") : t("groups.addBudget")}
            </DialogTitle>
          </DialogHeader>
          <GroupBudgetForm
            groupId={groupId}
            budget={selectedBudget || undefined}
            onSuccess={() => {
              setIsFormDialogOpen(false);
              onChange();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Budget Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("groups.deleteBudget")}</DialogTitle>
            <DialogDescription>
              {t("groups.deleteBudgetConfirmation", {
                name: selectedBudget?.name,
              })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBudget}
              disabled={isLoading}
            >
              {isLoading ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
