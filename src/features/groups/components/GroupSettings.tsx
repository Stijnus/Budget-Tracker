import { useState } from "react";
import { useTranslation } from "react-i18next";
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

interface GroupSettingsProps {
  group: any;
  onUpdateGroup: (group: any) => void;
}

export function GroupSettings({ group, onUpdateGroup }: GroupSettingsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [isActive, setIsActive] = useState(group.is_active);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await updateBudgetGroup(group.id, {
        name,
        description,
        is_active: isActive,
      });

      if (error) throw error;

      onUpdateGroup(data);
      setSuccess(t("groups.settingsSaved"));

      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating group:", err);
      setError("Failed to update group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsLoading(true);

    try {
      const { error } = await deleteBudgetGroup(group.id);

      if (error) throw error;

      // Navigate back to groups page
      navigate("/groups");
    } catch (err) {
      console.error("Error deleting group:", err);
      setError("Failed to delete group. Please try again.");
      setIsDeleteDialogOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{t("groups.generalSettings")}</CardTitle>
            <CardDescription>
              {t("groups.generalSettingsDescription")}
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
              <Label htmlFor="name">{t("groups.groupName")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t("groups.groupDescription")}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">{t("groups.activeStatus")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("groups.activeStatusDescription")}
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
              {isLoading ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            {t("groups.dangerZone")}
          </CardTitle>
          <CardDescription>{t("groups.dangerZoneDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t("groups.deleteGroupWarning")}
          </p>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("groups.deleteGroup")}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Group Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("groups.deleteGroup")}</DialogTitle>
            <DialogDescription>
              {t("groups.deleteGroupConfirmation", { name: group.name })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {t("groups.deleteGroupWarningDetailed")}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGroup}
              disabled={isLoading}
            >
              {isLoading ? t("common.deleting") : t("groups.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
