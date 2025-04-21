import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { TransactionFilters } from "../features/transactions/components/TransactionFilters";
import { formatDate } from "../utils/formatters";

export function ExpensesPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "expense",
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
          <div className="text-sm text-gray-500">
            {formatDate(new Date(), "long")}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <TransactionFilters
            filters={filters}
            onFilterChange={setFilters}
          />
          
          <TransactionList 
            showAddButton={true}
          />
        </div>
      </div>
    </AppLayout>
  );
}
