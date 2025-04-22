import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Clock,
  Tag,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Edit,
  Loader2,
  X,
} from "lucide-react";
import {
  BillWithCategory,
  getBillById,
  markBillAsPaid,
  addBillPayment,
} from "../../../api/supabase/bills";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { PaymentHistory } from "./PaymentHistory";
import { BillModal } from "./BillModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface BillDetailsProps {
  billId: string;
  onClose: () => void; // Used in the parent component
}

export function BillDetails({ billId }: BillDetailsProps) {
  const [bill, setBill] = useState<BillWithCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  useEffect(() => {
    async function fetchBillDetails() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getBillById(billId);

        if (error) {
          throw error;
        }

        setBill(data);
      } catch (err) {
        console.error("Error fetching bill details:", err);
        setError("Failed to load bill details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBillDetails();
  }, [billId]);

  const handleMarkAsPaid = async () => {
    if (!bill) return;

    try {
      const { data, error } = await markBillAsPaid(bill.id);
      if (error) throw error;

      // Update the bill in local state
      if (data) setBill(data);
    } catch (err) {
      console.error("Error marking bill as paid:", err);
      setError("Failed to mark bill as paid");
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bill) return;

    try {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid payment amount");
        return;
      }

      const { error } = await addBillPayment(
        bill.id,
        amount,
        new Date(),
        paymentMethod || undefined,
        paymentNotes || undefined
      );

      if (error) throw error;

      // Refresh bill details
      const { data: updatedBill } = await getBillById(bill.id);
      setBill(updatedBill);

      // Reset form
      setPaymentAmount("");
      setPaymentMethod("");
      setPaymentNotes("");
      setIsPaymentModalOpen(false);
    } catch (err) {
      console.error("Error adding payment:", err);
      setError("Failed to add payment");
    }
  };

  const handleBillUpdate = async () => {
    // Refresh bill details
    const { data, error } = await getBillById(billId);
    if (error) {
      console.error("Error refreshing bill details:", error);
      return;
    }

    setBill(data);
  };

  // Get frequency display text
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "one-time":
        return "One-time";
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return frequency;
    }
  };

  // Check if a bill is due soon (within the next 7 days)
  const isDueSoon = (nextDueDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Check if a bill is overdue
  const isOverdue = (nextDueDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    return dueDate < today;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
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

  if (!bill) {
    return <div className="p-4 text-muted-foreground">Bill not found</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{bill.name}</CardTitle>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              aria-label="Edit"
            >
              <Edit size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center mb-4">
                <DollarSign size={18} className="text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(bill.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <Calendar size={18} className="text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Next Due Date</p>
                  <p className="font-medium">
                    {bill.next_due_date
                      ? formatDate(bill.next_due_date, "medium")
                      : "Not set"}

                    {bill.next_due_date && isOverdue(bill.next_due_date) && (
                      <span className="ml-2 text-xs text-destructive font-normal">
                        Overdue
                      </span>
                    )}

                    {bill.next_due_date &&
                      !isOverdue(bill.next_due_date) &&
                      isDueSoon(bill.next_due_date) && (
                        <span className="ml-2 text-xs text-yellow-600 font-normal">
                          Due soon
                        </span>
                      )}
                  </p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                <Clock size={18} className="text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-medium">
                    {getFrequencyText(bill.frequency)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <Tag size={18} className="text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">
                    {bill.category_name || "Uncategorized"}
                  </p>
                </div>
              </div>

              {bill.payment_method && (
                <div className="flex items-center mb-4">
                  <CreditCard
                    size={18}
                    className="text-muted-foreground mr-2"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="font-medium">{bill.payment_method}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center mb-4">
                <AlertCircle size={18} className="text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{bill.status}</p>
                </div>
              </div>
            </div>
          </div>

          {bill.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">
                {bill.notes}
              </p>
            </div>
          )}

          <div className="flex space-x-3 mb-6">
            <Button
              onClick={handleMarkAsPaid}
              variant="secondary"
              className="flex items-center"
            >
              <CheckCircle2 size={16} className="mr-1" />
              Mark as Paid
            </Button>

            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center"
            >
              <DollarSign size={16} className="mr-1" />
              Add Payment
            </Button>
          </div>

          <PaymentHistory billId={bill.id} className="mt-6" />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <BillModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        bill={bill}
        onSuccess={handleBillUpdate}
      />

      {/* Add Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Amount *</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  id="paymentAmount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="pl-7"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                type="text"
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g., Credit Card, Bank Transfer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Notes</Label>
              <Textarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
