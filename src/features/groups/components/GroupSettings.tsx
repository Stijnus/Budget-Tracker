import { useState } from "react";
// Translation imports removed
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updateBudgetGroup,
  deleteBudgetGroup,
} from "../../../api/supabase/budgetGroups";
import { Trash2 } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface GroupSettingsProps {
  group: Group;
  onUpdateGroup: (group: Group) => void;
}

export function GroupSettings({ group, onUpdateGroup }: GroupSettingsProps) {
  // Translation hooks removed
  const navigate = useNavigate();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [isActive, setIsActive] = useState(group.is_active);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Updating group with ID:", group.id, {
        name,
        description,
        is_active: isActive,
      });

      const { data, error } = await updateBudgetGroup(group.id, {
        name,
        description,
        is_active: isActive,
      });

      if (error) {
        console.error("Error from updateBudgetGroup:", error);
        throw error;
      }

      console.log("Group updated successfully:", data);
      onUpdateGroup(data);
      setSuccess("Settings saved successfully!");

      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating group:", err);
      setError(
        `Failed to update group: ${
          (err as Error).message || "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    // Verify that the user has typed the correct group name
    if (confirmText !== group.name) {
      setError("Please type the exact group name to confirm deletion.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Deleting group with ID:", group.id);
      const { error } = await deleteBudgetGroup(group.id);

      if (error) {
        console.error("Error from deleteBudgetGroup:", error);
        throw error;
      }

      console.log("Group deleted successfully");
      // Navigate back to groups page
      navigate("/groups");
    } catch (err) {
      console.error("Error deleting group:", err);
      setError(
        `Failed to delete group: ${
          (err as Error).message || "Please try again."
        }`
      );
      setIsDeleteDialogOpen(false);
      setIsLoading(false);
    }
  };

  const handleOpenDeleteDialog = () => {
    setConfirmText("");
    setError(null);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Manage your group's basic information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert
                variant="default"
                className="bg-green-50 border-green-200 text-green-800"
              >
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Group Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  When inactive, members won't be able to create new
                  transactions
                </p>
              </div>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Actions that can't be undone</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting this group will permanently remove all associated data
            including transactions, budgets, and member information.
          </p>
          <Button variant="destructive" onClick={handleOpenDeleteDialog}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Group
          </Button>
        </CardContent>
      </Card>

      {/* Delete Group Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the group "{group.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              All group data including transactions, budgets, and member
              information will be permanently deleted. Members will lose access
              to all shared resources.
            </p>
            <div className="mt-4 p-4 border border-destructive/20 bg-destructive/5 rounded-md">
              <p className="text-sm font-medium text-destructive">
                Type the group name to confirm deletion:
              </p>
              <Input
                className="mt-2"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={group.name}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGroup}
              disabled={isLoading || confirmText !== group.name}
            >
              {isLoading ? "Deleting..." : "Delete Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
