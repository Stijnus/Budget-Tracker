import { Transaction } from "../../../api/supabase/transactions";
import { TransactionForm } from "./TransactionForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
  onSuccess: () => void;
  defaultType?: "expense" | "income";
  title?: string;
}

export function TransactionDialog({
  isOpen,
  onClose,
  transaction,
  onSuccess,
  defaultType,
  title,
}: TransactionDialogProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>
            {title || (transaction ? "Edit Transaction" : defaultType === "income" ? "Add Income" : "Add Expense")}
          </SheetTitle>
          <SheetClose className="absolute top-4 right-4" />
        </SheetHeader>
        <div className="px-6 pb-6">
          <TransactionForm
            transaction={transaction}
            onClose={onClose}
            onSuccess={onSuccess}
            defaultType={defaultType}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
