import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getExpensesByCategory } from "../../../api/supabase/analytics";
import { formatCurrency } from "../../../utils/formatters";

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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>;
  }

  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 h-64 flex items-center justify-center">
        <p>No expense data available for the selected period.</p>
      </div>
    );
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom legend
  const renderLegend = () => (
    <ul className="flex flex-wrap justify-center mt-4 gap-4">
      {data.map((entry, index) => (
        <li key={`legend-${index}`} className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{
              backgroundColor:
                entry.color ||
                `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            }}
          />
          <span className="text-sm">
            {entry.name} ({((entry.value / total) * 100).toFixed(1)}%)
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Expenses by Category
      </h3>

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
    </div>
  );
}
