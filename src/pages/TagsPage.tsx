import { AppLayout } from "../shared/components/layout";
import { TagList } from "../features/tags/components/TagList";
import { formatDate } from "../utils/formatters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, TagIcon } from "lucide-react";

export function TagsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagIcon className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Tags</h2>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-2 px-3 py-1"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(new Date(), "long")}</span>
          </Badge>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tag Management</CardTitle>
            <CardDescription>
              Manage your transaction tags. Tags help you organize and filter
              your transactions across categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TagList showAddButton={true} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
