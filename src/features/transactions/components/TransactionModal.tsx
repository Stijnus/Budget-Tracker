import { Transaction } from "../../../api/supabase/transactions";
import { TransactionForm } from "./TransactionForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
  onSuccess: () => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  transaction,
  onSuccess,
}: TransactionModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>
            {transaction ? "Edit Expense" : "Add Expense"}
          </SheetTitle>
          <SheetClose className="absolute top-4 right-4" />
        </SheetHeader>
        <div className="px-6 pb-6">
          <TransactionForm
            transaction={transaction}
            onClose={onClose}
            onSuccess={onSuccess}
            defaultType="expense"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
