import { useState, useEffect } from "react";
import { getGoalContributions } from "../../../api/supabase/goals";
import { formatCurrency, formatDate } from "../../../utils/formatters";

interface ContributionHistoryProps {
  goalId: string;
  className?: string;
}

interface Contribution {
  id: string;
  goal_id: string;
  amount: number;
  contribution_date: string;
  notes: string | null;
  created_at: string;
}

export function ContributionHistory({
  goalId,
  className = "",
}: ContributionHistoryProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContributions() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await getGoalContributions(goalId);

        if (error) {
          throw error;
        }

        setContributions(data || []);
      } catch (err) {
        console.error("Error fetching contributions:", err);
        setError("Failed to load contribution history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContributions();
  }, [goalId]);

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Contribution History
        </h3>
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Contribution History
        </h3>
        <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Contribution History
      </h3>

      {contributions.length === 0 ? (
        <div className="text-center p-4 bg-gray-50 rounded-md text-gray-500">
          No contributions yet
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contributions.map((contribution) => (
                <tr key={contribution.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(contribution.contribution_date, "medium")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(contribution.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {contribution.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
