import { useState, useEffect } from "react";
import { getBillPaymentHistory } from "../../../api/supabase/bills";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function PaymentHistory({
  billId,
  className = "",
}: PaymentHistoryProps) {
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
        console.error("Error fetching payment history:", err);
        setError("Failed to load payment history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPaymentHistory();
  }, [billId]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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

  if (payments.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No payment history available.
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-muted/50 rounded-md overflow-hidden">
            <ul className="divide-y divide-border">
              {payments.map((payment) => (
                <li key={payment.id} className="p-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {formatDate(payment.payment_date, "medium")}
                      </p>
                      {payment.payment_method && (
                        <p className="text-muted-foreground text-xs">
                          via {payment.payment_method}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="font-normal">
                        {formatCurrency(payment.amount)}
                      </Badge>
                      {payment.notes && (
                        <p className="text-muted-foreground text-xs mt-1">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
