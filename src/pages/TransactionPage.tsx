import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AppLayout } from "../shared/components/layout";
import { TransactionForm } from "../features/transactions/components/TransactionForm";
import { getTransactionById, Transaction } from "../api/supabase/transactions";
import { Button } from "@/components/ui/button";

export function TransactionPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(!!transactionId);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're adding an expense from the expenses page
  const isExpensePage = location.pathname.startsWith("/expenses");

  // Fetch transaction if editing
  useEffect(() => {
    async function fetchTransaction() {
      if (!transactionId) return;

      try {
        setIsLoading(true);
        const { data, error } = await getTransactionById(transactionId);

        if (error) throw error;
        if (!data) throw new Error("Transaction not found");

        setTransaction(data as Transaction);
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError("Failed to load transaction");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransaction();
  }, [transactionId]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate("/expenses");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-4 text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="mr-2"
          >
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-2xl font-bold">
            {transactionId ? "Edit Transaction" : "Add Transaction"}
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <TransactionForm
            transaction={transaction || undefined}
            onClose={handleClose}
            onSuccess={handleSuccess}
            defaultType={isExpensePage ? "expense" : undefined}
          />
        </div>
      </div>
    </AppLayout>
  );
}
