import { BankAccountPage as BankAccountPageComponent } from "../features/bankAccounts/pages/BankAccountPage";
import { AppLayout } from "../shared/components/layout/AppLayout";

export function BankAccountPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 max-w-5xl">
        <BankAccountPageComponent />
      </div>
    </AppLayout>
  );
}
