import { useState, useEffect } from "react";
import {
  getBudgets,
  deleteBudget,
  Budget,
} from "../../../api/supabase/budgets";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { BudgetModal } from "./BudgetModal";
import { Edit, Trash2, Plus, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface BudgetListProps {
  showAddButton?: boolean;
  className?: string;
}

export function BudgetList({
  showAddButton = false,
  className = "",
}: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(
    undefined
  );
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
      setBudgets(budgets.filter((b) => b.id !== budgetToDelete));
      setIsDeleteConfirmOpen(false);
      setBudgetToDelete(null);
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError("Failed to delete budget");
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

  // Progress calculation will be implemented in a future update

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
      {/* Add Budget Button */}
      {showAddButton && (
        <div className="mb-4 flex justify-end">
          <Button onClick={handleAddBudget} size="sm">
            <Plus size={16} className="mr-1" />
            Add Budget
          </Button>
        </div>
      )}

      {/* Budgets List */}
      <Card>
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No budgets found.{" "}
              {showAddButton && (
                <Button
                  onClick={handleAddBudget}
                  variant="link"
                  className="px-1 py-0 h-auto"
                >
                  Create your first budget
                </Button>
              )}{" "}
              to start tracking your spending!
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {budgets.map((budget) => (
                <li
                  key={budget.id}
                  className="p-4 hover:bg-muted/50 rounded-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-md font-medium">{budget.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {budget.category_id ? "Category" : "All Categories"} •
                        {budget.period === "monthly"
                          ? " Monthly"
                          : budget.period === "yearly"
                          ? " Yearly"
                          : " Custom"}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        onClick={() => handleEditBudget(budget)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(budget.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      {formatCurrency(0)} of {formatCurrency(budget.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(budget.start_date, "short")} -{" "}
                      {budget.end_date
                        ? formatDate(budget.end_date, "short")
                        : "Ongoing"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <Progress value={0} className="h-2" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budget={selectedBudget}
        onSuccess={handleBudgetSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => !open && handleDeleteCancel()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this budget? This action cannot be
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
