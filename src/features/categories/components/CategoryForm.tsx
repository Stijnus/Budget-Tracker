import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../../../state/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createCategory,
  updateCategory,
  Category,
  CategoryInsert,
} from "../../../api/supabase";
// Import directly from the file path to avoid TypeScript issues
import { CategoryColorPicker } from "../../../features/categories/components/CategoryColorPicker";

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryForm({
  category,
  onClose,
  onSuccess,
}: CategoryFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income" | "both">("expense");
  const [color, setColor] = useState("#3B82F6"); // Default blue color
  const [icon, setIcon] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type as "expense" | "income" | "both");
      setColor(category.color);
      setIcon(category.icon || "");
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate form
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (category) {
        // Update existing category
        const { error } = await updateCategory(category.id, {
          name,
          type,
          color,
          icon: icon || null,
        });

        if (error) throw error;
      } else {
        // Create new category
        const newCategory: CategoryInsert = {
          user_id: user.id,
          name,
          type,
          color,
          icon: icon || null,
          is_default: false,
        };

        const { error } = await createCategory(newCategory);
        if (error) throw error;
      }

      // Call success callback
      onSuccess();

      // Close the form
      onClose();
    } catch (err) {
      console.error("Error saving category:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save category. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Groceries, Rent, Salary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Category Type</Label>
            <Select
              value={type}
              onValueChange={(value) =>
                setType(value as "expense" | "income" | "both")
              }
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category Color</Label>
            <CategoryColorPicker color={color} onChange={setColor} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Optional)</Label>
            <Input
              id="icon"
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Icon name or URL"
            />
            <p className="text-xs text-muted-foreground">
              You can use an icon name from Lucide icons or a URL to a custom
              icon.
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : category
                ? "Update Category"
                : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
