import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { getIncomeVsExpenses } from '../../../api/supabase/analytics';
import { formatCurrency } from '../../../utils/formatters';

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

export function IncomeExpenseChart({ startDate, endDate, className = '' }: IncomeExpenseChartProps) {
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
            { name: 'Income', value: data.income, fill: '#10B981' },
            { name: 'Expenses', value: data.expenses, fill: '#EF4444' }
          ];
          
          setData(chartData);
          setNetSavings(data.income - data.expenses);
        }
      } catch (err) {
        console.error('Error fetching income vs expenses data:', err);
        setError('Failed to load income vs expenses data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
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

  // Calculate savings rate
  const incomeValue = data.find(item => item.name === 'Income')?.value || 0;
  const savingsRate = incomeValue > 0 ? Math.round((netSavings / incomeValue) * 100) : 0;

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Income vs Expenses
      </h3>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Net: <span className={netSavings >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCurrency(netSavings)}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Savings Rate: <span className={savingsRate >= 20 ? 'text-green-600' : savingsRate >= 0 ? 'text-yellow-600' : 'text-red-600'}>
            {savingsRate}%
          </span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value, { compact: true })} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="value" name="Amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
            {/* Add a reference line for net savings */}
            <ReferenceLine y={0} stroke="#000" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
