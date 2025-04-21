import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  BillWithCategory,
  getBills,
  deleteBill,
  markBillAsPaid,
} from "../../../api/supabase/bills";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { BillModal } from "./BillModal";

interface BillListProps {
  showAddButton?: boolean;
  className?: string;
}

export function BillList({
  showAddButton = false,
  className = "",
}: BillListProps) {
  const [bills, setBills] = useState<BillWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<
    BillWithCategory | undefined
  >(undefined);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  // Fetch bills
  useEffect(() => {
    async function fetchBills() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getBills();

        if (error) {
          throw error;
        }

        setBills(data || []);
      } catch (err) {
        console.error("Error fetching bills:", err);
        setError("Failed to load bills");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBills();
  }, []);

  // Handle opening the add/edit modal
  const handleAddBill = () => {
    setSelectedBill(undefined);
    setIsModalOpen(true);
  };

  const handleEditBill = (bill: BillWithCategory) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  // Handle bill deletion
  const handleDeleteClick = (id: string) => {
    setBillToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!billToDelete) return;

    try {
      const { error } = await deleteBill(billToDelete);
      if (error) throw error;

      // Remove from local state
      setBills(bills.filter((b) => b.id !== billToDelete));
      setIsDeleteConfirmOpen(false);
      setBillToDelete(null);
    } catch (err) {
      console.error("Error deleting bill:", err);
      setError("Failed to delete bill");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    setBillToDelete(null);
  };

  // Handle marking a bill as paid
  const handleMarkAsPaid = async (id: string) => {
    try {
      const { error } = await markBillAsPaid(id);
      if (error) throw error;

      // Update the bill in local state
      setBills(
        bills.map((bill) =>
          bill.id === id
            ? {
                ...bill,
                payment_status: "paid",
                last_paid_date: new Date().toISOString().split("T")[0],
              }
            : bill
        )
      );
    } catch (err) {
      console.error("Error marking bill as paid:", err);
      setError("Failed to mark bill as paid");
    }
  };

  // Handle bill refresh after add/edit
  const handleBillSuccess = () => {
    // Refetch bills
    async function fetchBills() {
      try {
        const { data, error } = await getBills();
        if (error) throw error;
        setBills(data || []);
      } catch (err) {
        console.error("Error fetching bills:", err);
      }
    }

    fetchBills();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  return (
    <div className={`${className}`}>
      {/* Add Bill Button */}
      {showAddButton && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleAddBill}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Bill
          </button>
        </div>
      )}

      {/* Bills List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {bills.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="mb-4">
              No bills found. Add your first bill to start tracking!
            </p>
            {showAddButton && (
              <button
                onClick={handleAddBill}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Add Bill
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {bills.map((bill) => (
              <li key={bill.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      {bill.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {bill.category_name
                        ? bill.category_name
                        : "Uncategorized"}{" "}
                      •{getFrequencyText(bill.frequency)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMarkAsPaid(bill.id)}
                      className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                      aria-label="Mark as Paid"
                      title="Mark as Paid"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      onClick={() => handleEditBill(bill)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(bill.id)}
                      className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-medium text-gray-700">
                    {formatCurrency(bill.amount)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      bill.status
                    )}`}
                  >
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  <span>
                    Next due:{" "}
                    {bill.next_due_date
                      ? formatDate(bill.next_due_date, "medium")
                      : "Not set"}
                  </span>
                </div>

                {/* Alert if due soon or overdue */}
                {bill.next_due_date && isOverdue(bill.next_due_date) && (
                  <div className="mt-2 flex items-center text-xs text-red-600">
                    <AlertCircle size={14} className="mr-1" />
                    Overdue
                  </div>
                )}

                {bill.next_due_date &&
                  !isOverdue(bill.next_due_date) &&
                  isDueSoon(bill.next_due_date) && (
                    <div className="mt-2 flex items-center text-xs text-yellow-600">
                      <AlertCircle size={14} className="mr-1" />
                      Due soon
                    </div>
                  )}

                {/* Payment method if available */}
                {bill.payment_method && (
                  <div className="mt-1 text-xs text-gray-500">
                    Payment method: {bill.payment_method}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bill Modal */}
      <BillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bill={selectedBill}
        onSuccess={handleBillSuccess}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this bill? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
