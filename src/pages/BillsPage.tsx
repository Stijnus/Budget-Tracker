import { AppLayout } from "../shared/components/layout";
import { AddBillsAndSubscriptions } from "../features/bills/components/AddBillsAndSubscriptions";
import { formatDate } from "../utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Receipt, CalendarIcon } from "lucide-react";

export function BillsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-cyan-500" />
            <h2 className="text-2xl font-bold">Bills & Subscriptions</h2>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(new Date(), "long")}</span>
          </Badge>
        </div>
        <AddBillsAndSubscriptions />
      </div>
    </AppLayout>
  );
}
