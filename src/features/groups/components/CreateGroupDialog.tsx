import { useState } from "react";
// Translation imports removed
import { useAuth } from "../../../state/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createBudgetGroup } from "../../../api/supabase/budgetGroups";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: () => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  onCreateGroup,
}: CreateGroupDialogProps) {
  // Translation hooks removed
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error("No user found");
      setError("You must be logged in to create a group");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Creating group with data:", {
        name,
        description,
        created_by: user.id,
        is_active: true,
      });

      const { error, data } = await createBudgetGroup({
        name,
        description,
        created_by: user.id,
        is_active: true,
      });

      if (error) {
        console.error("Error creating group:", error);
        throw error;
      }

      console.log("Group created successfully:", data);
      onCreateGroup();
      resetForm();
    } catch (err) {
      console.error("Error creating group:", err);
      setError(
        `Failed to create group: ${
          (err as Error).message || "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Create Group</SheetTitle>
          <SheetClose className="absolute top-4 right-4" />
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{"GroupName"}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={"GroupNamePlaceholder"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{"GroupDescription"}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={"GroupDescriptionPlaceholder"}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
