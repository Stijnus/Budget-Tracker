import { useAuth } from "../state/useAuth";
import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { BudgetSummary } from "../features/budgets/components/BudgetSummary";
import { SpendingSummary } from "../features/dashboard/components/SpendingSummary";
import { formatDate } from "../utils/formatters";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.user_metadata?.full_name || "User"}
          </h2>
          <div className="text-sm text-gray-500">
            {formatDate(new Date(), "long")}
          </div>
        </div>

        {/* Monthly spending summary */}
        <div className="mb-6">
          <SpendingSummary />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Budget Progress
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View All
                </button>
              </div>
              <BudgetSummary />
            </div>
          </div>

          {/* Recent transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Transactions
                </h3>
                <div className="flex space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View All
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                    Add New
                  </button>
                </div>
              </div>
              <TransactionList />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
