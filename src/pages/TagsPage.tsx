import { AppLayout } from "../shared/components/layout";
import { TagList } from "../features/tags/components/TagList";
import { formatDate } from "../utils/formatters";

export function TagsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Tags</h2>
          <div className="text-sm text-gray-500">
            {formatDate(new Date(), "long")}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <TagList showAddButton={true} />
        </div>
      </div>
    </AppLayout>
  );
}
