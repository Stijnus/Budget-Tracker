import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  BillWithCategory,
  BillInsert,
  createBill,
  updateBill,
} from "../../../api/supabase/bills";
import { BillForm } from "./BillForm";

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill?: BillWithCategory;
  onSuccess: () => void;
}

export function BillModal({
  isOpen,
  onClose,
  bill,
  onSuccess,
}: BillModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (billData: BillInsert) => {
    try {
      setError(null);

      if (bill) {
        // Update existing bill
        const { error } = await updateBill(bill.id, billData);
        if (error) throw error;
      } else {
        // Create new bill
        const { error } = await createBill(billData);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving bill:", err);
      setError("Failed to save bill. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bill ? "Edit Bill" : "Add New Bill"}</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <BillForm bill={bill} onSubmit={handleSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
