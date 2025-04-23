import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { TransactionFilters } from "../features/transactions/components/TransactionFilters";
import { TransactionDialog } from "../features/transactions/components/TransactionDialog";
import { formatDate } from "../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, CalendarIcon, Plus } from "lucide-react";

export function IncomePage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "INCOME",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <ArrowUpCircle className="mr-2 h-5 w-5 text-green-500" />
              Income Transactions
            </CardTitle>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
            >
              <Plus size={16} />
              Add Income
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
          defaultType="income"
          title="Add Income"
        />
      </div>
    </AppLayout>
  );
}
