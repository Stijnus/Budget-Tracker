import { useState, useEffect } from "react";
import { getCurrentBudgets } from "../../../api/supabase/budgets";
import { formatCurrency } from "../../../utils/formatters";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category_name?: string;
  category_color?: string;
}

export function BudgetSummary() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBudgets() {
      try {
        setIsLoading(true);
        const { data, error } = await getCurrentBudgets();

        if (error) {
          throw new Error(error.message);
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

  if (budgets.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="mb-4">Create your first budget to track your spending!</p>
        <Button onClick={() => (window.location.href = "/budgets")}>
          Create Budget
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = Math.min(
            Math.round((budget.spent / budget.amount) * 100),
            100
          );
          const isOverBudget = budget.spent > budget.amount;

          return (
            <Card key={budget.id} className="p-4">
              <CardContent className="p-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{budget.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(budget.spent)} /{" "}
                    {formatCurrency(budget.amount)}
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      isOverBudget ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isOverBudget
                        ? undefined
                        : budget.category_color,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    {budget.category_name || "General"}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      isOverBudget
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {percentage}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={() => (window.location.href = "/budgets")}
          className="text-sm h-auto p-0"
        >
          View All Budgets
        </Button>
      </div>
    </div>
  );
}
