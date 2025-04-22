import { useState, useEffect } from "react";
import { getMonthlySpending } from "../../../api/supabase/transactions";
import { formatCurrency } from "../../../utils/formatters";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpendingSummaryData {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  month: string;
  year: number;
}

export function SpendingSummary() {
  const [summary, setSummary] = useState<SpendingSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setIsLoading(true);
        const { data, error } = await getMonthlySpending();

        if (error) {
          throw new Error(error.message);
        }

        setSummary(data || null);
      } catch (err) {
        console.error("Error fetching spending summary:", err);
        setError("Failed to load spending summary");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
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

  // If no summary data, show a simplified view with zeros
  if (!summary) {
    // Simple view with zeros - no need for month/year in this version

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-destructive/10 border-0 dark:bg-destructive/20">
              <CardContent className="p-6">
                <p className="text-sm text-destructive mb-1">Expenses</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-500/10 border-0 dark:bg-green-500/20">
              <CardContent className="p-6">
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                  Savings
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(0)}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalIncome, totalExpenses, netSavings, month, year } = summary;
  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {month} {year} Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-500/10 border-0 dark:bg-blue-500/20">
            <CardContent className="p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                Income
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalIncome)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-destructive/10 border-0 dark:bg-destructive/20">
            <CardContent className="p-4">
              <p className="text-sm text-destructive mb-1">Expenses</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(totalExpenses)}
              </p>
            </CardContent>
          </Card>

          <Card
            className={`${
              netSavings >= 0
                ? "bg-green-500/10 dark:bg-green-500/20"
                : "bg-yellow-500/10 dark:bg-yellow-500/20"
            } border-0`}
          >
            <CardContent className="p-4">
              <p
                className={`text-sm ${
                  netSavings >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-600 dark:text-yellow-400"
                } mb-1`}
              >
                {netSavings >= 0 ? "Savings" : "Deficit"}
              </p>
              <p
                className={`text-2xl font-bold ${
                  netSavings >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {formatCurrency(Math.abs(netSavings))}
              </p>
            </CardContent>
          </Card>
        </div>

        {totalIncome > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-muted-foreground">Savings Rate</p>
              <p className="text-sm font-medium">{savingsRate}%</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  savingsRate >= 20
                    ? "bg-green-600 dark:bg-green-500"
                    : savingsRate >= 0
                    ? "bg-yellow-500 dark:bg-yellow-400"
                    : "bg-destructive"
                }`}
                style={{ width: `${Math.max(savingsRate, 0)}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
