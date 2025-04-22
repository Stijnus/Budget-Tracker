import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Target } from "lucide-react";
import { GoalsList } from "../features/goals/components/GoalsList";
import { GoalDetails } from "../features/goals/components/GoalDetails";
import { AppLayout } from "../shared/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GoalsPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const pageTitle = "Financial Goals";

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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Financial Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {goalId ? (
              <GoalDetails goalId={goalId} />
            ) : (
              <GoalsList showAddButton={true} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
