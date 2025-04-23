import { Transaction } from "../../../api/supabase/transactions";
import { TransactionForm } from "./TransactionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {title || (transaction ? "Edit Transaction" : "Add Transaction")}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <TransactionForm
            transaction={transaction}
            onClose={onClose}
            onSuccess={onSuccess}
            defaultType={defaultType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
