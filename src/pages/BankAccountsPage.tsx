import { BankAccountsPage as BankAccountsPageComponent } from "../features/bankAccounts/pages/BankAccountsPage";
import { AppLayout } from "../shared/components/layout/AppLayout";

export function BankAccountsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 max-w-5xl">
        <BankAccountsPageComponent />
      </div>
    </AppLayout>
  );
}
