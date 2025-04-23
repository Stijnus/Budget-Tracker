import { GroupsPage as GroupsPageComponent } from "../features/groups/pages/GroupsPage";
import { AppLayout } from "../shared/components/layout/AppLayout";

export function GroupsPage() {
  return (
    <AppLayout>
      <GroupsPageComponent />
    </AppLayout>
  );
}
