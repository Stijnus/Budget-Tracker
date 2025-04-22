import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { TransactionFilters } from "../features/transactions/components/TransactionFilters";
import { formatDate } from "../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, CalendarIcon } from "lucide-react";

export function IncomePage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "income",
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold">Income</h2>
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
            <CardTitle className="text-lg">Income Transactions</CardTitle>
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
