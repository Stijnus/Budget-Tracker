import { useState, useEffect } from "react";
import { getMonthlySpending } from "../../../api/supabase/transactions";
import { formatCurrency } from "../../../utils/formatters";
import { AlertCircle, Loader2, ArrowUpCircle, ArrowDownCircle, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="overflow-hidden border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(0)}
            </div>
            <div className="mt-3">
              <Progress value={0} className="h-2 bg-green-100" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Current month
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-red-500 bg-gradient-to-br from-red-50/50 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(0)}
            </div>
            <div className="mt-3">
              <Progress value={0} className="h-2 bg-red-100" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Current month
          </CardFooter>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
              Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(0)}
            </div>
            <div className="mt-3">
              <Progress value={0} className="h-2 bg-green-100" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            Current month
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { totalIncome, totalExpenses, netSavings, month, year } = summary;
  const savingsRate =
    totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="overflow-hidden border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
            Total Income
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <div className="mt-3">
            <Progress
              value={totalIncome > 0 ? 100 : 0}
              className="h-2 bg-green-100"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {month} {year}
        </CardFooter>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-red-500 bg-gradient-to-br from-red-50/50 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="mt-3">
            <Progress
              value={totalExpenses > 0 ? 100 : 0}
              className="h-2 bg-red-100"
            />
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {month} {year}
        </CardFooter>
      </Card>

      <Card
        className={`overflow-hidden border-l-4 ${
          netSavings >= 0
            ? "border-l-green-500 bg-gradient-to-br from-green-50/50 to-transparent"
            : "border-l-red-500 bg-gradient-to-br from-red-50/50 to-transparent"
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {netSavings >= 0 ? (
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            )}
            {netSavings >= 0 ? "Savings" : "Deficit"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div
            className={`text-2xl font-bold ${
              netSavings >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(Math.abs(netSavings))}
          </div>
          <div className="mt-3">
            {totalIncome > 0 && (
              <Progress
                value={Math.min(100, Math.abs((netSavings / totalIncome) * 100))}
                className="h-2 bg-gray-100"
              />
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground flex justify-between">
          <div>
            <Calendar className="h-3 w-3 mr-1 inline" />
            {month} {year}
          </div>
          <div>
            {totalIncome > 0 && (
              <span className="font-medium">
                {savingsRate}% of income
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
