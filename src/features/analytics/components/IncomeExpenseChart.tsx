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
  ReferenceLine,
} from "recharts";
import { getIncomeVsExpenses } from "../../../api/supabase/analytics";
import { formatCurrency } from "../../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IncomeExpenseChartProps {
  startDate: string;
  endDate: string;
  className?: string;
}

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export function IncomeExpenseChart({
  startDate,
  endDate,
  className = "",
}: IncomeExpenseChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [netSavings, setNetSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getIncomeVsExpenses(startDate, endDate);

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          const chartData = [
            { name: "Income", value: data.income, fill: "#10B981" },
            { name: "Expenses", value: data.expenses, fill: "#EF4444" },
          ];

          setData(chartData);
          setNetSavings(data.income - data.expenses);
        }
      } catch (err) {
        console.error("Error fetching income vs expenses data:", err);
        setError("Failed to load income vs expenses data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  // Custom tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: ChartData;
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{item.name}</p>
          <p className="text-gray-700">{formatCurrency(item.value)}</p>
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
          <CardTitle className="text-lg">Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground h-64 flex items-center justify-center">
            <p>No transaction data available for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate savings rate
  const incomeValue = data.find((item) => item.name === "Income")?.value || 0;
  const savingsRate =
    incomeValue > 0 ? Math.round((netSavings / incomeValue) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Badge variant="outline" className="px-2 py-1">
            Net:{" "}
            <span
              className={
                netSavings >= 0 ? "text-green-600" : "text-destructive"
              }
            >
              {formatCurrency(netSavings)}
            </span>
          </Badge>
          <Badge
            variant="outline"
            className={`px-2 py-1 ${
              savingsRate >= 20
                ? "border-green-600"
                : savingsRate >= 0
                ? "border-yellow-600"
                : "border-destructive"
            }`}
          >
            Savings Rate:{" "}
            <span
              className={
                savingsRate >= 20
                  ? "text-green-600"
                  : savingsRate >= 0
                  ? "text-yellow-600"
                  : "text-destructive"
              }
            >
              {savingsRate}%
            </span>
          </Badge>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(value, { compact: true })
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="value"
                name="Amount"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
              {/* Add a reference line for net savings */}
              <ReferenceLine y={0} stroke="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
