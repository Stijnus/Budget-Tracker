import { useState } from "react";
import { X } from "lucide-react";
import {
  GoalWithCategory,
  GoalInsert,
  createGoal,
  updateGoal,
} from "../../../api/supabase/goals";
import { GoalForm } from "./GoalForm";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {goal ? "Edit Goal" : "Add New Goal"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <GoalForm goal={goal} onSubmit={handleSubmit} onCancel={onClose} />
      </div>
    </div>
  );
}
