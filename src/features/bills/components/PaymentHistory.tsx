import { useState, useEffect } from 'react';
import { getBillPaymentHistory } from '../../../api/supabase/bills';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface PaymentHistoryProps {
  billId: string;
  className?: string;
}

interface Payment {
  id: string;
  bill_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export function PaymentHistory({ billId, className = '' }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchPaymentHistory() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await getBillPaymentHistory(billId);
        
        if (error) {
          throw error;
        }
        
        setPayments(data || []);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError('Failed to load payment history');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPaymentHistory();
  }, [billId]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="p-3 text-red-500 bg-red-50 rounded-md text-sm">{error}</div>;
  }
  
  if (payments.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No payment history available.
      </div>
    );
  }
  
  return (
    <div className={`${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">Payment History</h4>
      <div className="bg-gray-50 rounded-md overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <li key={payment.id} className="p-3 text-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{formatDate(payment.payment_date, 'medium')}</p>
                  {payment.payment_method && (
                    <p className="text-gray-500 text-xs">
                      via {payment.payment_method}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                  {payment.notes && (
                    <p className="text-gray-500 text-xs">
                      {payment.notes}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
