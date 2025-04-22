import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getExpensesByCategory } from "../../../api/supabase/analytics";
import { formatCurrency } from "../../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExpenseCategoryChartProps {
  startDate: string;
  endDate: string;
  className?: string;
}

interface CategoryData {
  id: string;
  name: string;
  color: string;
  value: number;
}

export function ExpenseCategoryChart({
  startDate,
  endDate,
  className = "",
}: ExpenseCategoryChartProps) {
  const [data, setData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getExpensesByCategory(startDate, endDate);

        if (error) {
          throw new Error(error.message);
        }

        setData(data || []);
      } catch (err) {
        console.error("Error fetching category data:", err);
        setError("Failed to load expense category data");
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
      payload: CategoryData;
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
          <CardTitle className="text-lg">Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-muted-foreground h-64 flex items-center justify-center">
            <p>No expense data available for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom legend
  const renderLegend = () => (
    <div className="flex flex-wrap justify-center mt-4 gap-2">
      {data.map((entry, index) => (
        <Badge
          key={`legend-${index}`}
          variant="outline"
          className="flex items-center gap-1 px-2 py-1"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                entry.color ||
                `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            }}
          />
          <span>
            {entry.name} ({((entry.value / total) * 100).toFixed(1)}%)
          </span>
        </Badge>
      ))}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.color ||
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {renderLegend()}
      </CardContent>
    </Card>
  );
}
