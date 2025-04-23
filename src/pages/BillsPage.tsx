import { useState } from "react";
import { AppLayout } from "../shared/components/layout";
import { BillList } from "../features/bills/components/BillList";
import { BillDetails } from "../features/bills/components/BillDetails";
import { BillModal } from "../features/bills/components/BillModal";
import { Button } from "@/components/ui/button";
import { formatDate } from "../utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Receipt, CalendarIcon, Plus } from "lucide-react";

export function BillsPage() {
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <Card className="border-t-4 border-t-cyan-500">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Receipt className="mr-2 h-5 w-5 text-cyan-500" />
                Bills & Subscriptions
              </CardTitle>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus size={16} />
                Add Bill
              </Button>
            </CardHeader>
            <CardContent>
              <BillList
                showAddButton={false}
                onAddBill={() => setIsModalOpen(true)}
              />
            </CardContent>
          </Card>
        )}

        {/* Bill Modal */}
        <BillModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
