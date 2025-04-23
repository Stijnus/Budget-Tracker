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
import { Button } from "@/components/ui/button";
import { CalendarIcon, TagIcon, Plus } from "lucide-react";
import { useState } from "react";
import { TagModal } from "../features/tags/components/TagModal";

export function TagsPage() {
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagIcon className="h-6 w-6 text-indigo-500" />
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

        <Card className="border-t-4 border-t-indigo-500">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <TagIcon className="mr-2 h-5 w-5 text-indigo-500" />
                Tag Management
              </CardTitle>
              <CardDescription>
                Manage your transaction tags. Tags help you organize and filter
                your transactions across categories.
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsTagModalOpen(true)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={16} />
              Add Tag
            </Button>
          </CardHeader>
          <CardContent>
            <TagList
              showAddButton={false}
              onAddTag={() => setIsTagModalOpen(true)}
            />
          </CardContent>
        </Card>

        {/* Tag Modal */}
        <TagModal
          isOpen={isTagModalOpen}
          onClose={() => setIsTagModalOpen(false)}
          onSuccess={() => setIsTagModalOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
