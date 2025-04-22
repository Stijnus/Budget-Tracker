import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Tag as TagIcon } from "lucide-react";
import { AppLayout } from "../shared/components/layout";
import { TagForm } from "../features/tags/components/TagForm";
import { getTagById, type Tag } from "../api/supabase/tags";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function TagPage() {
  const { tagId } = useParams<{ tagId: string }>();
  const navigate = useNavigate();
  const [tag, setTag] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(tagId && tagId !== "new");
  const [error, setError] = useState<string | null>(null);

  // Fetch tag if editing
  useEffect(() => {
    async function fetchTag() {
      if (!tagId || tagId === "new") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await getTagById(tagId);

        if (error) throw error;
        if (!data) throw new Error("Tag not found");

        setTag(data);
      } catch (err) {
        console.error("Error fetching tag:", err);
        setError("Failed to load tag");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTag();
  }, [tagId]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate("/tags");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="mr-2"
          >
            <ChevronLeft size={20} />
          </Button>
          <TagIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">
            {tagId && tagId !== "new" ? "Edit Tag" : "Add Tag"}
          </h2>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-2xl mx-auto">
          <TagForm
            tag={tag || undefined}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </AppLayout>
  );
}
