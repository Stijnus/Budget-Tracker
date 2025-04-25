import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateBudgetGroup, getBudgetGroup } from "../../../api/supabase/budgetGroups";

interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  onEditGroup: () => void;
}

export function EditGroupDialog({ open, onOpenChange, groupId, onEditGroup }: EditGroupDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    async function fetchGroup() {
      setIsLoading(true);
      setError(null);
      const { data, error } = await getBudgetGroup(groupId);
      if (error) {
        setError("Failed to load group");
      } else if (data) {
        setName(data.name || "");
        setDescription(data.description || "");
      }
      setIsLoading(false);
    }
    fetchGroup();
  }, [groupId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to edit a group");
      return;
    }
    setIsLoading(true);
    setError(null);
    const { error } = await updateBudgetGroup(groupId, {
      name,
      description,
    });
    if (error) {
      setError("Failed to update group");
    } else {
      onEditGroup();
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-md">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Edit Group</SheetTitle>
          <SheetClose className="absolute top-4 right-4" />
        </SheetHeader>
        <div className="px-6 pb-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !name}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
