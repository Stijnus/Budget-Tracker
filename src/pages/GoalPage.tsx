import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Target } from "lucide-react";
import { AppLayout } from "../shared/components/layout";
import { GoalForm } from "../features/goals/components/GoalForm";
import {
  getGoalById,
  createGoal,
  updateGoal,
  GoalInsert,
} from "../api/supabase/goals";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function GoalPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(!!goalId);
  const [error, setError] = useState<string | null>(null);

  // Fetch goal if editing
  useEffect(() => {
    async function fetchGoal() {
      if (!goalId || goalId === "new") return;

      try {
        setIsLoading(true);
        const { data, error } = await getGoalById(goalId);

        if (error) throw error;
        if (!data) throw new Error("Goal not found");

        setGoal(data);
      } catch (err) {
        console.error("Error fetching goal:", err);
        setError("Failed to load goal");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGoal();
  }, [goalId]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = async (goalData: GoalInsert) => {
    try {
      setError(null);

      if (goalId && goalId !== "new") {
        // Update existing goal
        const { error } = await updateGoal(goalId, goalData);
        if (error) throw error;
      } else {
        // Create new goal
        const { error } = await createGoal(goalData);
        if (error) throw error;
      }

      navigate("/goals");
    } catch (err) {
      console.error("Error saving goal:", err);
      setError("Failed to save goal. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="mr-2"
          >
            <ChevronLeft size={20} />
          </Button>
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">
            {goalId && goalId !== "new" ? "Edit Goal" : "Add Goal"}
          </h2>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-2xl mx-auto">
          <GoalForm
            goal={goal || undefined}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </div>
    </AppLayout>
  );
}
