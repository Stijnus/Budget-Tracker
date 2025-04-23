import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getSpendingTrend } from "../../../api/supabase/analytics";
import { formatCurrency } from "../../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface SpendingTrendChartProps {
  startDate: string;
  endDate: string;
  groupBy?: "day" | "month";
  className?: string;
}

interface TrendData {
  date: string;
  income: number;
  expenses: number;
}

export function SpendingTrendChart({
  startDate,
  endDate,
  groupBy = "month",
  className = "",
}: SpendingTrendChartProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getSpendingTrend(
          startDate,
          endDate,
          groupBy
        );

        if (error) {
          throw new Error(error.message);
        }

        // Format dates for display
        const formattedData = (data || []).map((item) => {
          let displayDate = item.date;

          // Format date for display
          if (groupBy === "month") {
            const [year, month] = item.date.split(" ");
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            displayDate = date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          } else {
            const date = new Date(item.date);
            displayDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }

          return {
            ...item,
            displayDate,
          };
        });

        setData(formattedData);
      } catch (err) {
        console.error("Error fetching spending trend data:", err);
        setError("Failed to load spending trend data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate, groupBy]);

  // Custom tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length && payload.length >= 2) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{label}</p>
          <p className="text-green-600">
            Income: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-red-600">
            Expenses: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-gray-700 border-t border-gray-200 mt-2 pt-2">
            Net: {formatCurrency(payload[0].value - payload[1].value)}
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
          <CardTitle className="text-lg">
            Spending Trend ({groupBy === "month" ? "Monthly" : "Daily"})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground h-64 flex items-center justify-center">
            <p>No transaction data available for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          Spending Trend ({groupBy === "month" ? "Monthly" : "Daily"})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(value, { compact: true })
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10B981"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#EF4444"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
