import { useState } from "react";
import { BankAccountList } from "../components/BankAccountList";
import { BankAccountForm } from "../components/BankAccountForm";
import { BankAccount } from "../../../api/supabase/bankAccounts";
import { CreditCard, Wallet } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "../../../utils/formatters";

type AccountType = "checking" | "savings" | "credit" | "investment" | "other";

export function BankAccountsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<
    BankAccount | undefined
  >(undefined);
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleAddAccount = () => {
    setSelectedAccount(undefined);
    setIsFormOpen(true);
  };

  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAccount(undefined);
  };

  const handleFormSuccess = () => {
    // Form was successfully submitted
    setIsFormOpen(false);
    setSelectedAccount(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Bank Accounts</h2>
        </div>
        <Badge
          variant="outline"
          className="flex items-center gap-2 px-3 py-1"
        >
          <Wallet className="h-4 w-4" />
          <span>{formatDate(new Date(), "long")}</span>
        </Badge>
      </div>

      <div className="mt-6">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              All Accounts
            </TabsTrigger>
            <TabsTrigger 
              value="checking"
              className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              Checking
            </TabsTrigger>
            <TabsTrigger 
              value="savings"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
            >
              Savings
            </TabsTrigger>
            <TabsTrigger 
              value="credit"
              className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
            >
              Credit
            </TabsTrigger>
            <TabsTrigger 
              value="investment"
              className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              Investment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <BankAccountList
              onEdit={handleEditAccount}
              onAdd={handleAddAccount}
            />
          </TabsContent>

          <TabsContent value="checking" className="mt-0">
            <BankAccountList
              onEdit={handleEditAccount}
              onAdd={handleAddAccount}
              accountType="checking"
            />
          </TabsContent>

          <TabsContent value="savings" className="mt-0">
            <BankAccountList
              onEdit={handleEditAccount}
              onAdd={handleAddAccount}
              accountType="savings"
            />
          </TabsContent>

          <TabsContent value="credit" className="mt-0">
            <BankAccountList
              onEdit={handleEditAccount}
              onAdd={handleAddAccount}
              accountType="credit"
            />
          </TabsContent>

          <TabsContent value="investment" className="mt-0">
            <BankAccountList
              onEdit={handleEditAccount}
              onAdd={handleAddAccount}
              accountType="investment"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bank Account Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>
              {selectedAccount ? "Edit Account" : "Add Account"}
            </SheetTitle>
            <SheetClose className="absolute top-4 right-4" />
          </SheetHeader>
          <div className="px-6 pb-6">
            <BankAccountForm
              account={selectedAccount}
              onClose={handleFormClose}
              onSuccess={handleFormSuccess}
              defaultType={
                activeTab === "all" ? "checking" : (activeTab as AccountType)
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
