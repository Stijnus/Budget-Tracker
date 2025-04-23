import { useState } from "react";
import { BankAccountList } from "../components/BankAccountList";
import { BankAccountForm } from "../components/BankAccountForm";
import { BankAccount } from "../../../api/supabase/bankAccounts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "../../../shared/components/PageHeader";

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
    <div className="container mx-auto py-6 max-w-5xl">
      <PageHeader
        title="Bank Accounts"
        description="Manage your bank accounts and track your balances"
        action={
          <Button onClick={handleAddAccount}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Accounts</TabsTrigger>
            <TabsTrigger value="checking">Checking</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="credit">Credit</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
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

      {/* Bank Account Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <BankAccountForm
            account={selectedAccount}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
            defaultType={
              activeTab === "all" ? "checking" : (activeTab as AccountType)
            }
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
