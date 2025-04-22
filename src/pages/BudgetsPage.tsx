import { AppLayout } from "../shared/components/layout";
import { BudgetList } from "../features/budgets/components/BudgetList";
import { formatDate } from "../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BudgetsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Budgets</h2>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(new Date(), "long")}</span>
          </Badge>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Budget Management</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetList showAddButton={true} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
