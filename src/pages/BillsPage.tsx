import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { BillList } from "../features/bills/components/BillList";
import { BillDetails } from "../features/bills/components/BillDetails";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function BillsPage() {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Bills & Subscriptions</h2>
        </div>

        {selectedBillId ? (
          <div>
            <Button
              onClick={() => setSelectedBillId(null)}
              variant="ghost"
              className="mb-4 flex items-center p-0 h-auto font-normal"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Bills
            </Button>

            <BillDetails
              billId={selectedBillId}
              onClose={() => setSelectedBillId(null)}
            />
          </div>
        ) : (
          <BillList showAddButton={true} />
        )}
      </div>
    </AppLayout>
  );
}
