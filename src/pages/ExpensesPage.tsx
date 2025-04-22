import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { TransactionFilters } from "../features/transactions/components/TransactionFilters";
import { formatDate } from "../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, CalendarIcon } from "lucide-react";

export function ExpensesPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "expense",
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="h-6 w-6 text-destructive" />
            <h2 className="text-2xl font-bold">Expenses</h2>
          </div>
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
            <CardTitle className="text-lg">Expense Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionFilters filters={filters} onFilterChange={setFilters} />

            <div className="mt-6">
              <TransactionList showAddButton={true} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
