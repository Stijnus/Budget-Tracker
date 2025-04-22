import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, PiggyBank } from "lucide-react";
import { AppLayout } from "../shared/components/layout";
import { BudgetForm } from "../features/budgets/components/BudgetForm";
import { getBudgetById } from "../api/supabase/budgets";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function BudgetPage() {
  const { budgetId } = useParams<{ budgetId: string }>();
  const navigate = useNavigate();
  const [budget, setBudget] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(!!budgetId);
  const [error, setError] = useState<string | null>(null);

  // Fetch budget if editing
  useEffect(() => {
    async function fetchBudget() {
      if (!budgetId || budgetId === "new") return;

      try {
        setIsLoading(true);
        const { data, error } = await getBudgetById(budgetId);

        if (error) throw error;
        if (!data) throw new Error("Budget not found");

        setBudget(data);
      } catch (err) {
        console.error("Error fetching budget:", err);
        setError("Failed to load budget");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBudget();
  }, [budgetId]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate("/budgets");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="mr-2"
          >
            <ChevronLeft size={20} />
          </Button>
          <PiggyBank className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">
            {budgetId && budgetId !== "new" ? "Edit Budget" : "Add Budget"}
          </h2>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-2xl mx-auto">
          <BudgetForm
            budget={budget || undefined}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </AppLayout>
  );
}
