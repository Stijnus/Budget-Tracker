import { BankAccountsPage as BankAccountsPageComponent } from "../features/bankAccounts/pages/BankAccountsPage";
import { AppLayout } from "../shared/components/layout/AppLayout";

export function BankAccountsPage() {
  return (
    <AppLayout>
      <BankAccountsPageComponent />
    </AppLayout>
  );
}
