import { Budget } from "../../../api/supabase/budgets";
import { BudgetForm } from "./BudgetForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>
            {budget ? "Edit Budget" : "Add Budget"}
          </SheetTitle>
          <SheetClose className="absolute top-4 right-4" />
        </SheetHeader>
        <div className="px-6 pb-6">
          <BudgetForm budget={budget} onClose={onClose} onSuccess={onSuccess} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
