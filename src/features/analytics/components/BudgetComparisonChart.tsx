import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getBudgetVsActual } from "../../../api/supabase/analytics";
import { formatCurrency } from "../../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface BudgetComparisonChartProps {
  className?: string;
}

interface BudgetData {
  name: string;
  budget: number;
  actual: number;
  category: string;
  color: string;
}

export function BudgetComparisonChart({
  className = "",
}: BudgetComparisonChartProps) {
  const [data, setData] = useState<BudgetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getBudgetVsActual();

        if (error) {
          throw new Error(error.message);
        }

        setData(data || []);
      } catch (err) {
        console.error("Error fetching budget comparison data:", err);
        setError("Failed to load budget comparison data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Custom tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const budgetValue = payload.find((p) => p.name === "Budget")?.value || 0;
      const actualValue = payload.find((p) => p.name === "Actual")?.value || 0;
      const difference = budgetValue - actualValue;
      const isOverBudget = difference < 0;

      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">Budget: {formatCurrency(budgetValue)}</p>
          <p className="text-orange-600">
            Actual: {formatCurrency(actualValue)}
          </p>
          <p
            className={`border-t border-gray-200 mt-2 pt-2 ${
              isOverBudget ? "text-red-600" : "text-green-600"
            }`}
          >
            {isOverBudget ? "Over budget by " : "Under budget by "}
            {formatCurrency(Math.abs(difference))}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
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

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Budget vs Actual Spending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground h-64 flex items-center justify-center">
            <p>No budget data available. Create budgets to see comparison.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for the chart
  const chartData = data.map((item) => ({
    name: item.name,
    Budget: item.budget,
    Actual: item.actual,
    color: item.color,
  }));

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Budget vs Actual Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barGap={0}
              barCategoryGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                interval={0}
                tickFormatter={(value) =>
                  value.length > 10 ? `${value.substring(0, 10)}...` : value
                }
              />
              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(value, { compact: true })
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Budget" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#F97316">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.Actual > entry.Budget ? "#EF4444" : "#F97316"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
