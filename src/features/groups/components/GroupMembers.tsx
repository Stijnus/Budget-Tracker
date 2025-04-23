import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, UserMinus, UserCog, Shield } from "lucide-react";
import {
  updateGroupMember,
  removeGroupMember,
} from "../../../api/supabase/budgetGroups";

interface GroupMember {
  group_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  joined_at: string;
  user?: {
    id: string;
    email?: string;
    user_profiles?: {
      full_name?: string | null;
      avatar_url?: string | null;
    } | null;
  } | null;
}

interface GroupMembersProps {
  groupId: string;
  members: GroupMember[];
  userRole: string;
  currentUserId: string;
}

export function GroupMembers({
  groupId,
  members,
  userRole,
  currentUserId,
}: GroupMembersProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null
  );
  const [newRole, setNewRole] = useState<string>("");

  const isAdmin = userRole === "owner" || userRole === "admin";

  const handleChangeRole = async () => {
    if (!selectedMember || !newRole) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateGroupMember(groupId, selectedMember.user_id, {
        role: newRole as "owner" | "admin" | "member" | "viewer",
      });

      // Note: In a real application, we would update the local state here
      // but for this example, we'll rely on the parent component to refresh the data

      // Close dialog
      setIsChangeRoleDialogOpen(false);
      setSelectedMember(null);
      setNewRole("");
    } catch (err) {
      console.error("Error changing role:", err);
      setError("Failed to change role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    setError(null);

    try {
      await removeGroupMember(groupId, selectedMember.user_id);

      // Note: In a real application, we would update the local state here
      // but for this example, we'll rely on the parent component to refresh the data

      // Close dialog
      setIsRemoveDialogOpen(false);
      setSelectedMember(null);
    } catch (err) {
      console.error("Error removing member:", err);
      setError("Failed to remove member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canManageMember = (member: GroupMember) => {
    // Owners can manage everyone except themselves
    if (userRole === "owner") {
      return member.user_id !== currentUserId;
    }

    // Admins can manage members and viewers, but not owners or other admins
    if (userRole === "admin") {
      return member.role !== "owner" && member.role !== "admin";
    }

    return false;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "member":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "owner" || role === "admin") {
      return <Shield className="h-3 w-3 mr-1" />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("groups.members")}</CardTitle>
          <CardDescription>{t("groups.membersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    {member.user?.user_profiles?.avatar_url && (
                      <AvatarImage
                        src={member.user.user_profiles.avatar_url}
                        alt={
                          member.user?.user_profiles?.full_name ||
                          member.user?.email ||
                          ""
                        }
                      />
                    )}
                    <AvatarFallback>
                      {(
                        member.user?.user_profiles?.full_name ||
                        member.user?.email ||
                        ""
                      )
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {member.user?.user_profiles?.full_name ||
                        member.user?.email}
                      {member.user_id === currentUserId && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({t("groups.you")})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.user?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getRoleBadgeVariant(member.role)}
                    className="flex items-center"
                  >
                    {getRoleIcon(member.role)}
                    {t(
                      `groups.role${
                        member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)
                      }`
                    )}
                  </Badge>

                  {isAdmin && canManageMember(member) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member);
                            setNewRole(member.role);
                            setIsChangeRoleDialogOpen(true);
                          }}
                        >
                          <UserCog className="mr-2 h-4 w-4" />
                          {t("groups.changeRole")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member);
                            setIsRemoveDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          {t("groups.removeMember")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog
        open={isChangeRoleDialogOpen}
        onOpenChange={setIsChangeRoleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("groups.changeRole")}</DialogTitle>
            <DialogDescription>
              {t("groups.changeRoleDescription", {
                name:
                  selectedMember?.user?.user_profiles?.full_name ||
                  selectedMember?.user?.email,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder={t("groups.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                {userRole === "owner" && (
                  <SelectItem value="admin">{t("groups.roleAdmin")}</SelectItem>
                )}
                <SelectItem value="member">{t("groups.roleMember")}</SelectItem>
                <SelectItem value="viewer">{t("groups.roleViewer")}</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-sm text-muted-foreground">
              {newRole === "admin"
                ? t("groups.roleAdminDescription")
                : newRole === "member"
                ? t("groups.roleMemberDescription")
                : newRole === "viewer"
                ? t("groups.roleViewerDescription")
                : ""}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangeRoleDialogOpen(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={
                isLoading || !newRole || newRole === selectedMember?.role
              }
            >
              {isLoading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("groups.removeMember")}</DialogTitle>
            <DialogDescription>
              {t("groups.removeMemberConfirmation", {
                name:
                  selectedMember?.user?.user_profiles?.full_name ||
                  selectedMember?.user?.email,
              })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={isLoading}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isLoading}
            >
              {isLoading ? t("common.removing") : t("groups.removeMember")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
