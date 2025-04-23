import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { TransactionDialog } from "../features/transactions/components/TransactionDialog";
import { formatDate } from "../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ListIcon, Plus } from "lucide-react";

export function TransactionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <ListIcon className="mr-2 h-5 w-5 text-primary" />
              All Transactions
            </CardTitle>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Add Transaction
            </Button>
          </CardHeader>
          <CardContent>
            <TransactionList showFilters={true} showAddButton={true} />
          </CardContent>
        </Card>

        {/* Transaction Dialog */}
        <TransactionDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={() => {
            setIsDialogOpen(false);
          }}
          title="Add Transaction"
        />
      </div>
    </AppLayout>
  );
}
