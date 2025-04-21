import { useState, useEffect } from 'react';
import { getRecentTransactions } from '../../../api/supabase/transactions';
import { formatCurrency } from '../../../utils/formatters';

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  type: 'expense' | 'income';
  category_id: string | null;
  category_name?: string;
  category_color?: string;
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        const { data, error } = await getRecentTransactions();
        
        if (error) {
          throw new Error(error.message);
        }
        
        setTransactions(data || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
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

  if (transactions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No transactions found. Add your first transaction to get started!
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="py-4 flex items-center">
            <div 
              className="w-2 h-10 rounded-full mr-4"
              style={{ backgroundColor: transaction.category_color || '#CBD5E0' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {transaction.description || 'Unnamed transaction'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {new Date(transaction.date).toLocaleDateString()} • {transaction.category_name || 'Uncategorized'}
              </p>
            </div>
            <div className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
