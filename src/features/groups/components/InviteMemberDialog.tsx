import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../state/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createInvitation } from "../../../api/supabase/budgetGroups";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  onInvite?: () => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  groupId,
  onInvite,
}: InviteMemberDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [familyRole, setFamilyRole] = useState<
    "parent" | "child" | "guardian" | "other" | ""
  >("");
  const [isFamily, setIsFamily] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Set expiration date to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Prepare invitation data
      const invitationData = {
        group_id: groupId,
        invited_by: user.id,
        email,
        role,
        status: "pending",
        expires_at: expiresAt.toISOString(),
        // Include family role metadata if this is a family invitation
        metadata:
          isFamily && familyRole ? { family_role: familyRole } : undefined,
      };

      console.log("Creating invitation:", invitationData);

      const { error } = await createInvitation(invitationData);

      if (error) throw error;

      setSuccess(t("groups.invitationSent"));
      setEmail("");
      if (onInvite) onInvite();

      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      console.error("Error sending invitation:", err);
      setError("Failed to send invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setRole("member");
    setFamilyRole("");
    setIsFamily(false);
    setError(null);
    setSuccess(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("groups.inviteMember")}</DialogTitle>
          <DialogDescription>
            {t("groups.inviteMemberDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
            <Label htmlFor="email">{t("groups.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("groups.emailPlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t("groups.role")}</Label>
            <Select
              value={role}
              onValueChange={(value) =>
                setRole(value as "admin" | "member" | "viewer")
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder={t("groups.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t("groups.roleAdmin")}</SelectItem>
                <SelectItem value="member">{t("groups.roleMember")}</SelectItem>
                <SelectItem value="viewer">{t("groups.roleViewer")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {role === "admin"
                ? t("groups.roleAdminDescription")
                : role === "member"
                ? t("groups.roleMemberDescription")
                : t("groups.roleViewerDescription")}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-family"
                checked={isFamily}
                onCheckedChange={(checked) => setIsFamily(checked === true)}
              />
              <Label htmlFor="is-family">
                {t("groups.isFamilyMember") || "This is a family member"}
              </Label>
            </div>

            {isFamily && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="family-role">
                  {t("groups.familyRole") || "Family Role"}
                </Label>
                <Select
                  value={familyRole}
                  onValueChange={(value) =>
                    setFamilyRole(
                      value as "parent" | "child" | "guardian" | "other" | ""
                    )
                  }
                >
                  <SelectTrigger id="family-role">
                    <SelectValue
                      placeholder={
                        t("groups.selectFamilyRole") || "Select a family role"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">
                      {t("groups.roleParent") || "Parent"}
                    </SelectItem>
                    <SelectItem value="child">
                      {t("groups.roleChild") || "Child"}
                    </SelectItem>
                    <SelectItem value="guardian">
                      {t("groups.roleGuardian") || "Guardian"}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("groups.roleOther") || "Other"}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {familyRole === "parent"
                    ? t("groups.roleParentDescription") ||
                      "Full access to manage family finances and children's accounts"
                    : familyRole === "child"
                    ? t("groups.roleChildDescription") ||
                      "Limited access based on parent settings"
                    : familyRole === "guardian"
                    ? t("groups.roleGuardianDescription") ||
                      "Similar to parent but with some restrictions"
                    : familyRole === "other"
                    ? t("groups.roleOtherDescription") ||
                      "Custom role with specific permissions"
                    : ""}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !email}>
              {isLoading ? t("common.sending") : t("groups.sendInvitation")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
