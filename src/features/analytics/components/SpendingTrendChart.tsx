import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { getSpendingTrend } from '../../../api/supabase/analytics';
import { formatCurrency } from '../../../utils/formatters';

interface SpendingTrendChartProps {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'month';
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
  groupBy = 'month',
  className = '' 
}: SpendingTrendChartProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await getSpendingTrend(startDate, endDate, groupBy);
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Format dates for display
        const formattedData = (data || []).map(item => {
          let displayDate = item.date;
          
          // Format date for display
          if (groupBy === 'month') {
            const [year, month] = item.date.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            displayDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          } else {
            const date = new Date(item.date);
            displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          
          return {
            ...item,
            displayDate
          };
        });
        
        setData(formattedData);
      } catch (err) {
        console.error('Error fetching spending trend data:', err);
        setError('Failed to load spending trend data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate, groupBy]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded-md border border-gray-200">
          <p className="font-medium">{label}</p>
          <p className="text-green-600">Income: {formatCurrency(payload[0].value)}</p>
          <p className="text-red-600">Expenses: {formatCurrency(payload[1].value)}</p>
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 h-64 flex items-center justify-center">
        <p>No transaction data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Spending Trend ({groupBy === 'month' ? 'Monthly' : 'Daily'})
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, { compact: true })}
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
    </div>
  );
}
