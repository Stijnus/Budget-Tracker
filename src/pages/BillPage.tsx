import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Receipt, CreditCard } from "lucide-react";
import { AppLayout } from "../shared/components/layout";
import { BillForm } from "../features/bills/components/BillForm";
import {
  getBillById,
  createBill,
  updateBill,
  BillInsert,
  BillWithCategory,
} from "../api/supabase/bills";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function BillPage() {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<BillWithCategory | null>(null);
  const [isLoading, setIsLoading] = useState(billId && billId !== "new");
  const [error, setError] = useState<string | null>(null);

  // Fetch bill if editing
  useEffect(() => {
    async function fetchBill() {
      if (!billId || billId === "new") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await getBillById(billId);

        if (error) throw error;
        if (!data) throw new Error("Bill not found");

        setBill(data);
      } catch (err) {
        console.error("Error fetching bill:", err);
        setError("Failed to load bill");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBill();
  }, [billId]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = async (billData: BillInsert) => {
    try {
      setError(null);

      if (billId && billId !== "new") {
        // Update existing bill
        const { error } = await updateBill(billId, billData);
        if (error) throw error;
      } else {
        // Create new bill
        const { error } = await createBill(billData);
        if (error) throw error;
      }

      navigate("/bills");
    } catch (err) {
      console.error("Error saving bill:", err);
      setError("Failed to save bill. Please try again.");
    }
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

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="mr-2"
          >
            <ChevronLeft size={20} />
          </Button>
          {bill?.frequency === "one-time" || !bill ? (
            <Receipt className="h-6 w-6 text-primary" />
          ) : (
            <CreditCard className="h-6 w-6 text-primary" />
          )}
          <h2 className="text-2xl font-bold">
            {billId && billId !== "new"
              ? bill?.frequency === "one-time"
                ? "Edit Bill"
                : "Edit Subscription"
              : "Add Bill or Subscription"}
          </h2>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-2xl mx-auto">
          <BillForm
            bill={bill || undefined}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </div>
    </AppLayout>
  );
}
