import { useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  GoalWithCategory,
  GoalInsert,
  createGoal,
  updateGoal,
} from "../../../api/supabase/goals";
import { GoalForm } from "./GoalForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: GoalWithCategory;
  onSuccess: () => void;
}

export function GoalModal({
  isOpen,
  onClose,
  goal,
  onSuccess,
}: GoalModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (goalData: GoalInsert) => {
    try {
      setError(null);

      if (goal) {
        // Update existing goal
        const { error } = await updateGoal(goal.id, goalData);
        if (error) throw error;
      } else {
        // Create new goal
        const { error } = await createGoal(goalData);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving goal:", err);
      setError("Failed to save goal. Please try again.");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>{goal ? "Edit Goal" : "Add New Goal"}</SheetTitle>
          <SheetClose className="absolute top-4 right-4" />
        </SheetHeader>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <GoalForm
          goal={goal}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}
