import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  BillWithCategory,
  getBills,
  deleteBill,
  markBillAsPaid,
} from "../../../api/supabase/bills";
import { formatCurrency, formatDate } from "../../../utils/formatters";
import { BillModal } from "./BillModal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // Status colors are now handled by the Badge component variants

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

  return (
    <div className={`${className}`}>
      {/* Add Bill Button */}
      {showAddButton && (
        <div className="mb-4 flex justify-end">
          <Button onClick={handleAddBill} className="flex items-center">
            <Plus size={16} className="mr-1" />
            Add Bill
          </Button>
        </div>
      )}

      {/* Bills List */}
      <Card>
        <CardContent className="p-0">
          {bills.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p className="mb-4">
                No bills found. Add your first bill to start tracking!
              </p>
              {showAddButton && (
                <Button onClick={handleAddBill}>Add Bill</Button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {bills.map((bill) => (
                <li
                  key={bill.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-md font-medium">{bill.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {bill.category_name
                          ? bill.category_name
                          : "Uncategorized"}{" "}
                        •{getFrequencyText(bill.frequency)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleMarkAsPaid(bill.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-green-600"
                        aria-label="Mark as Paid"
                        title="Mark as Paid"
                      >
                        <CheckCircle2 size={16} />
                      </Button>
                      <Button
                        onClick={() => handleEditBill(bill)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        aria-label="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(bill.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-medium">
                      {formatCurrency(bill.amount)}
                    </span>
                    <Badge
                      variant={
                        bill.status === "active"
                          ? "default"
                          : bill.status === "paused"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {bill.status.charAt(0).toUpperCase() +
                        bill.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
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
                    <div className="mt-2 flex items-center text-xs text-destructive">
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
                    <div className="mt-1 text-xs text-muted-foreground">
                      Payment method: {bill.payment_method}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Bill Modal */}
      <BillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bill={selectedBill}
        onSuccess={handleBillSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bill? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
