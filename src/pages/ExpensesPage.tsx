import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { TransactionFilters } from "../features/transactions/components/TransactionFilters";
import { TransactionDialog } from "../features/transactions/components/TransactionDialog";
import { formatDate } from "../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, CalendarIcon, Plus } from "lucide-react";

export function ExpensesPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "EXPENSE",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <ArrowDownCircle className="mr-2 h-5 w-5 text-red-500" />
              Expense Transactions
            </CardTitle>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700"
            >
              <Plus size={16} />
              Add Expense
            </Button>
          </CardHeader>
          <CardContent>
            <TransactionFilters
              type={filters.type}
              categoryId={filters.categoryId}
              bankAccountId={filters.bankAccountId}
              startDate={filters.startDate}
              endDate={filters.endDate}
              minAmount={filters.minAmount}
              maxAmount={filters.maxAmount}
              searchQuery={filters.searchQuery}
              onChange={setFilters}
            />

            <div className="mt-6">
              <TransactionList
                filters={filters}
                showFilters={false}
                showAddButton={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transaction Dialog */}
        <TransactionDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={() => {
            setIsDialogOpen(false);
            // Refresh the transaction list
            const newFilters = { ...filters };
            setFilters(newFilters);
          }}
          defaultType="expense"
          title="Add Expense"
        />
      </div>
    </AppLayout>
  );
}
