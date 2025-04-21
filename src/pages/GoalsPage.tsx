import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { GoalsList } from "../features/goals/components/GoalsList";
import { GoalDetails } from "../features/goals/components/GoalDetails";

export function GoalsPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const pageTitle = "Financial Goals";

  const handleBackToList = () => {
    navigate("/goals");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        {goalId && (
          <button
            onClick={handleBackToList}
            className="mr-3 p-1 rounded-full hover:bg-gray-100"
            aria-label="Back to goals list"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
      </div>

      {goalId ? (
        <GoalDetails goalId={goalId} />
      ) : (
        <GoalsList showAddButton={true} />
      )}
    </div>
  );
}
