import { AppLayout } from "../shared/components/layout";
import { BudgetList } from "../features/budgets/components/BudgetList";
import { formatDate } from "../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, PiggyBank, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function BudgetsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold">Budgets</h2>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(new Date(), "long")}</span>
          </Badge>
        </div>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <PiggyBank className="mr-2 h-5 w-5 text-amber-500" />
              Budget Management
            </CardTitle>
            <Button
              onClick={() => (window.location.href = "/budgets/new")}
              className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700"
            >
              <Plus size={16} />
              Add Budget
            </Button>
          </CardHeader>
          <CardContent>
            <BudgetList showAddButton={false} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
