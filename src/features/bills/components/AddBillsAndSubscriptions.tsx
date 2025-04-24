import { BillList } from "./BillList";
import { BillModal } from "./BillModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

import { CreditCard, Repeat } from "lucide-react";

export function AddBillsAndSubscriptions() {
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-6 w-full">
      {/* Bills Section */}
      <Card className="flex-1 border-t-4 border-t-cyan-500 bg-muted/40 shadow-sm">
        <CardHeader className="flex flex-col gap-2 pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-cyan-500" />
              <div>
                <CardTitle className="text-lg flex items-center gap-2">Bills</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Track one-time or irregular expenses.</p>
              </div>
            </div>
            <Button
              onClick={() => setIsBillModalOpen(true)}
              className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
              variant="default"
              size="sm"
            >
              <Plus size={16} /> Add Bill
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <BillList
            showAddButton={false}
            filterType="bill"
          />
        </CardContent>
      </Card>
      {/* Divider for desktop */}
      <div className="hidden md:block w-px bg-border mx-2" />
      {/* Subscriptions Section */}
      <Card className="flex-1 border-t-4 border-t-violet-500 bg-muted/40 shadow-sm">
        <CardHeader className="flex flex-col gap-2 pb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Repeat className="h-6 w-6 text-violet-500" />
              <div>
                <CardTitle className="text-lg flex items-center gap-2">Subscriptions</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Manage your recurring payments and services.</p>
              </div>
            </div>
            <Button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 focus:ring-2 focus:ring-violet-400 focus:outline-none transition"
              variant="default"
              size="sm"
            >
              <Plus size={16} /> Add Subscription
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <BillList
            showAddButton={false}
            filterType="subscription"
          />
        </CardContent>
      </Card>
      {/* Bill Modal */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSuccess={() => setIsBillModalOpen(false)}
        defaultType="bill"
      />
      {/* Subscription Modal */}
      <BillModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSuccess={() => setIsSubscriptionModalOpen(false)}
        defaultType="subscription"
      />
    </div>
  );
}
