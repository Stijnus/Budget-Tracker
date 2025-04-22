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
  ReferenceLine,
} from "recharts";
import { getIncomeVsExpenses } from "../../../api/supabase/analytics";
import { formatCurrency } from "../../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SavingsRateChartProps {
  startDate: string;
  endDate: string;
  className?: string;
}

export function SavingsRateChart({
  startDate,
  endDate,
  className = "",
}: SavingsRateChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getIncomeVsExpenses(
          startDate,
          endDate,
          "month"
        );

        if (error) {
          throw error;
        }

        // Calculate savings rate for each month
        const savingsRateData = Array.isArray(data)
          ? data.map((item) => {
              const income = item.income || 0;
              const expenses = item.expenses || 0;
              const savings = income - expenses;
              const savingsRate = income > 0 ? (savings / income) * 100 : 0;

              return {
                name: item.name,
                savingsRate: parseFloat(savingsRate.toFixed(1)),
                income,
                expenses,
                savings,
              };
            })
          : [];

        setData(savingsRateData);
      } catch (err) {
        console.error("Error fetching savings rate data:", err);
        setError("Failed to load savings rate data");
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
      payload: {
        name: string;
        savingsRate: number;
        income: number;
        expenses: number;
        savings: number;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-muted-foreground">
            Income: {formatCurrency(item.income)}
          </p>
          <p className="text-muted-foreground">
            Expenses: {formatCurrency(item.expenses)}
          </p>
          <p className="text-muted-foreground">
            Savings: {formatCurrency(item.savings)}
          </p>
          <p className={`font-medium ${getSavingsRateColor(item.savingsRate)}`}>
            Savings Rate: {item.savingsRate}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getSavingsRateColor = (rate: number) => {
    if (rate >= 20) return "text-green-600";
    if (rate >= 10) return "text-emerald-600";
    if (rate >= 0) return "text-yellow-600";
    return "text-destructive";
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
          <CardTitle className="text-lg">Savings Rate Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground h-64 flex items-center justify-center">
            <p>No transaction data available for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate average savings rate
  const totalSavingsRate = data.reduce(
    (sum, item) => sum + item.savingsRate,
    0
  );
  const averageSavingsRate = parseFloat(
    (totalSavingsRate / data.length).toFixed(1)
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Savings Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Badge
            variant="outline"
            className={`px-2 py-1 ${getSavingsRateColor(averageSavingsRate)}`}
          >
            Average Savings Rate: {averageSavingsRate}%
          </Badge>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-50 border-green-200">
              Good: ≥20%
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200">
              Fair: 0-20%
            </Badge>
            <Badge variant="outline" className="bg-red-50 border-red-200">
              Poor: &lt;0%
            </Badge>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                domain={[-10, 50]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine
                y={20}
                stroke="green"
                strokeDasharray="3 3"
                label="Good"
              />
              <ReferenceLine
                y={0}
                stroke="red"
                strokeDasharray="3 3"
                label="Minimum"
              />
              <Line
                type="monotone"
                dataKey="savingsRate"
                name="Savings Rate"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
