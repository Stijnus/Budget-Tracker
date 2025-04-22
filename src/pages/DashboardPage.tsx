import { useAuth } from "../state/useAuth";
import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { BudgetSummary } from "../features/budgets/components/BudgetSummary";
import { SpendingSummary } from "../features/dashboard/components/SpendingSummary";
import { formatDate } from "../utils/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Welcome, {user?.user_metadata?.full_name || "User"}
          </h2>
          <div className="text-sm text-muted-foreground">
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Budget Progress</CardTitle>
                <Button
                  variant="link"
                  className="h-8 px-2 lg:px-3"
                  onClick={() => (window.location.href = "/budgets")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <BudgetSummary />
              </CardContent>
            </Card>
          </div>

          {/* Recent transactions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <Button
                  variant="link"
                  className="h-8 px-2 lg:px-3"
                  onClick={() => (window.location.href = "/transactions")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <TransactionList limit={5} showAddButton={true} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
