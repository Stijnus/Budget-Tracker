import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BankAccountDetails } from "../components/BankAccountDetails";
import { BankAccountForm } from "../components/BankAccountForm";
import { BankAccount } from "../../../api/supabase/bankAccounts";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function BankAccountPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>(
    undefined
  );

  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    // Refresh the page to show updated data
    window.location.reload();
  };

  const handleDelete = () => {
    navigate("/accounts");
  };

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <BankAccountDetails
        accountId={id}
        onEdit={handleEditAccount}
        onDelete={handleDelete}
      />

      {/* Bank Account Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <BankAccountForm
            account={selectedAccount}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
