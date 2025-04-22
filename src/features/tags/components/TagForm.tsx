import { useState } from "react";
import { useAuth } from "../../../state/useAuth";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  createTag,
  updateTag,
  Tag,
  TagInsert,
} from "../../../api/supabase/tags";

interface TagFormProps {
  tag?: Tag;
  onClose: () => void;
  onSuccess: () => void;
}

// Predefined colors for tags
const TAG_COLORS = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#22C55E", // Green
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#0EA5E9", // Light Blue
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple
  "#D946EF", // Fuchsia
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#6B7280", // Gray
];

export function TagForm({ tag, onClose, onSuccess }: TagFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(tag?.name || "");
  const [color, setColor] = useState(tag?.color || TAG_COLORS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validate form
      if (!name.trim()) {
        setError("Please enter a tag name");
        return;
      }

      if (!color) {
        setError("Please select a color");
        return;
      }

      // Prepare tag data
      const tagData: TagInsert = {
        user_id: user.id,
        name: name.trim(),
        color,
      };

      let result;
      if (tag) {
        // Update existing tag
        result = await updateTag(tag.id, tagData);
      } else {
        // Create new tag
        result = await createTag(tagData);
      }

      if (result.error) {
        throw result.error;
      }

      // Success
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving tag:", err);
      setError("Failed to save tag");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {tag ? "Edit Tag" : "Create Tag"}
        </h2>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tag Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Tag Name</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Vacation, Business, Personal"
            required
          />
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <Label>Tag Color</Label>
          <div className="grid grid-cols-6 gap-2">
            {TAG_COLORS.map((colorOption) => (
              <Button
                key={colorOption}
                type="button"
                variant="outline"
                className={cn(
                  "w-8 h-8 p-0",
                  color === colorOption
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                )}
                style={{ backgroundColor: colorOption }}
                onClick={() => setColor(colorOption)}
                aria-label={`Select color ${colorOption}`}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="flex items-center space-x-2 p-2 border rounded-md">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm font-medium">{name || "Tag Name"}</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : tag ? "Update Tag" : "Create Tag"}
          </Button>
        </div>
      </form>
    </div>
  );
}
