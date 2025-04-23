import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BankAccountDetails } from "../components/BankAccountDetails";
import { BankAccountForm } from "../components/BankAccountForm";
import { BankAccount } from "../../../api/supabase/bankAccounts";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/accounts")}
          className="mr-2"
        >
          <ChevronLeft size={20} />
        </Button>
        <CreditCard className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Account Details</h2>
      </div>

      <BankAccountDetails
        accountId={id}
        onEdit={handleEditAccount}
        onDelete={handleDelete}
      />

      {/* Bank Account Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <BankAccountForm
            account={selectedAccount}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
