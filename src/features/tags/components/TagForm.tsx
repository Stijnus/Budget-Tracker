import { useState } from "react";
import { useAuth } from "../../../state/useAuth";
import { X } from "lucide-react";
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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {tag ? "Edit Tag" : "Create Tag"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tag Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tag Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Vacation, Business, Personal"
            required
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {TAG_COLORS.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                className={`w-8 h-8 rounded-full ${
                  color === colorOption ? "ring-2 ring-offset-2 ring-blue-500" : ""
                }`}
                style={{ backgroundColor: colorOption }}
                onClick={() => setColor(colorOption)}
                aria-label={`Select color ${colorOption}`}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-sm font-medium">
              {name || "Tag Name"}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Saving..."
              : tag
              ? "Update Tag"
              : "Create Tag"}
          </button>
        </div>
      </form>
    </div>
  );
}
