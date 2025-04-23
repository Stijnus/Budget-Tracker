import { BankAccountPage as BankAccountPageComponent } from "../features/bankAccounts/pages/BankAccountPage";
import { AppLayout } from "../shared/components/layout/AppLayout";

export function BankAccountPage() {
  return (
    <AppLayout>
      <BankAccountPageComponent />
    </AppLayout>
  );
}
