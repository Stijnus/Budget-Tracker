import { AppLayout } from "../shared/components/layout";
import { TransactionList } from "../features/transactions/components/TransactionList";
import { formatDate } from "../utils/formatters";

export function TransactionsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
          <div className="text-sm text-gray-500">
            {formatDate(new Date(), "long")}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <TransactionList 
            showFilters={true}
            showAddButton={true}
          />
        </div>
      </div>
    </AppLayout>
  );
}
