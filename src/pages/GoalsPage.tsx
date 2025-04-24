import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Target, Plus } from "lucide-react";
import { GoalsList } from "../features/goals/components/GoalsList";
import { GoalDetails } from "../features/goals/components/GoalDetails";
import { AppLayout } from "../shared/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import { GoalModal } from "../features/goals/components/GoalModal";

export function GoalsPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const pageTitle = "Financial Goals";
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const handleBackToList = () => {
    navigate("/goals");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {goalId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToList}
                className="mr-2"
                aria-label="Back to goals list"
              >
                <ChevronLeft size={20} />
              </Button>
            )}
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{pageTitle}</h2>
          </div>
        </div>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Target className="mr-2 h-5 w-5 text-purple-500" />
              Financial Goals
            </CardTitle>
            {!goalId && (
              <Button
                onClick={() => setIsGoalModalOpen(true)}
                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700"
              >
                <Plus size={16} />
                Add Goal
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {goalId ? (
              <GoalDetails goalId={goalId} />
            ) : (
              <GoalsList showAddButton={false} />
            )}
          </CardContent>
        </Card>
        {/* Goal Modal Sidebar */}
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          onSuccess={() => setIsGoalModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
