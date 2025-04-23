import { GroupPage as GroupPageComponent } from "../features/groups/pages/GroupPage";
import { AppLayout } from "../shared/components/layout/AppLayout";

export function GroupPage() {
  return (
    <AppLayout>
      <GroupPageComponent />
    </AppLayout>
  );
}
