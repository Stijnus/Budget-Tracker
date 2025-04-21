import { useState, useEffect } from 'react';
import { getMonthlySpending } from '../../../api/supabase/transactions';
import { formatCurrency } from '../../../utils/formatters';

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
        console.error('Error fetching spending summary:', err);
        setError('Failed to load spending summary');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
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

  if (!summary) {
    return (
      <div className="p-4 text-center text-gray-500">
        No spending data available. Add transactions to see your summary!
      </div>
    );
  }

  const { totalIncome, totalExpenses, netSavings, month, year } = summary;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {month} {year} Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Income</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-700 mb-1">Expenses</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
        </div>
        
        <div className={`${netSavings >= 0 ? 'bg-green-50' : 'bg-yellow-50'} p-4 rounded-lg`}>
          <p className={`text-sm ${netSavings >= 0 ? 'text-green-700' : 'text-yellow-700'} mb-1`}>
            {netSavings >= 0 ? 'Savings' : 'Deficit'}
          </p>
          <p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-green-700' : 'text-yellow-700'}`}>
            {formatCurrency(Math.abs(netSavings))}
          </p>
        </div>
      </div>
      
      {totalIncome > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">Savings Rate</p>
            <p className="text-sm font-medium text-gray-900">{savingsRate}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${savingsRate >= 20 ? 'bg-green-600' : savingsRate >= 0 ? 'bg-yellow-500' : 'bg-red-600'}`}
              style={{ width: `${Math.max(savingsRate, 0)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
