import { Budget } from "../../../api/supabase/budgets";
import { BudgetForm } from "./BudgetForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget;
  onSuccess: () => void;
}

export function BudgetModal({
  isOpen,
  onClose,
  budget,
  onSuccess,
}: BudgetModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-md">
        <BudgetForm budget={budget} onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
