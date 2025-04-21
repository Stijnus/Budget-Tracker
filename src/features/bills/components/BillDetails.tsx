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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>;
  }

  if (!bill) {
    return <div className="p-4 text-gray-500">Bill not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-gray-800">{bill.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            aria-label="Edit"
          >
            <Edit size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center mb-4">
            <DollarSign size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-lg font-medium">
                {formatCurrency(bill.amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Calendar size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Next Due Date</p>
              <p className="font-medium">
                {bill.next_due_date
                  ? formatDate(bill.next_due_date, "medium")
                  : "Not set"}

                {bill.next_due_date && isOverdue(bill.next_due_date) && (
                  <span className="ml-2 text-xs text-red-600 font-normal">
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
            <Clock size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Frequency</p>
              <p className="font-medium">{getFrequencyText(bill.frequency)}</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <Tag size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">
                {bill.category_name || "Uncategorized"}
              </p>
            </div>
          </div>

          {bill.payment_method && (
            <div className="flex items-center mb-4">
              <CreditCard size={18} className="text-gray-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{bill.payment_method}</p>
              </div>
            </div>
          )}

          <div className="flex items-center mb-4">
            <AlertCircle size={18} className="text-gray-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{bill.status}</p>
            </div>
          </div>
        </div>
      </div>

      {bill.notes && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
          <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
            {bill.notes}
          </p>
        </div>
      )}

      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleMarkAsPaid}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
        >
          <CheckCircle2 size={16} className="mr-1" />
          Mark as Paid
        </button>

        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          <DollarSign size={16} className="mr-1" />
          Add Payment
        </button>
      </div>

      <PaymentHistory billId={bill.id} className="mt-6" />

      {/* Edit Modal */}
      <BillModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        bill={bill}
        onSuccess={handleBillUpdate}
      />

      {/* Add Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Payment</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label
                  htmlFor="paymentAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Method
                </label>
                <input
                  type="text"
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Credit Card, Bank Transfer"
                />
              </div>

              <div>
                <label
                  htmlFor="paymentNotes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="paymentNotes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
