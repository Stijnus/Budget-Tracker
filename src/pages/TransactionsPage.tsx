import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { formatDate } from "../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ListIcon } from "lucide-react";

export function TransactionsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListIcon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Transactions</h2>
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
            <CardTitle className="text-lg">All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList showFilters={true} showAddButton={true} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
