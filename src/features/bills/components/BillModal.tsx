import { useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
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
  defaultType?: 'bill' | 'subscription';
}

export function BillModal({
  isOpen,
  onClose,
  bill,
  onSuccess,
  defaultType = 'bill',
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{bill ? "Edit Bill" : "Add New Bill"}</SheetTitle>
          <SheetClose>
            <X className="h-4 w-4" />
          </SheetClose>
        </SheetHeader>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <BillForm
          bill={bill}
          onSubmit={handleSubmit}
          onCancel={onClose}
          defaultType={!bill ? defaultType : undefined}
        />
      </SheetContent>
    </Sheet>
  );
}
