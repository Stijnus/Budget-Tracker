import { useState } from "react";
// Translation imports removed
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
  family_role?: "parent" | "child" | "guardian" | "other" | null;
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
  // Translation hooks removed
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(
    null
  );
  const [newRole, setNewRole] = useState<string>("");
  const [newFamilyRole, setNewFamilyRole] = useState<string>("");
  const [isFamilyRoleDialogOpen, setIsFamilyRoleDialogOpen] = useState(false);

  const isAdmin = userRole === "owner" || userRole === "admin";

  const handleChangeRole = async () => {
    if (!selectedMember || !newRole) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Updating member role:", {
        groupId,
        userId: selectedMember.user_id,
        role: newRole,
      });

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
      setError(
        `Failed to change role: ${
          (err as Error).message || "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeFamilyRole = async () => {
    if (!selectedMember || !newFamilyRole) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Updating member family role:", {
        groupId,
        userId: selectedMember.user_id,
        familyRole: newFamilyRole,
      });

      await updateGroupMember(groupId, selectedMember.user_id, {
        family_role: newFamilyRole as
          | "parent"
          | "child"
          | "guardian"
          | "other"
          | null,
      });

      // Close dialog
      setIsFamilyRoleDialogOpen(false);
      setSelectedMember(null);
      setNewFamilyRole("");
    } catch (err) {
      console.error("Error changing family role:", err);
      setError(
        `Failed to change family role: ${
          (err as Error).message || "Please try again."
        }`
      );
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
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage group members and their roles
          </CardDescription>
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
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.user?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={getRoleBadgeVariant(member.role)}
                      className="flex items-center"
                    >
                      {getRoleIcon(member.role)}
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </Badge>

                    {member.family_role && (
                      <Badge variant="outline" className="flex items-center">
                        {member.family_role.charAt(0).toUpperCase() +
                          member.family_role.slice(1)}
                      </Badge>
                    )}
                  </div>

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
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member);
                            setNewFamilyRole(member.family_role || "");
                            setIsFamilyRoleDialogOpen(true);
                          }}
                        >
                          <UserCog className="mr-2 h-4 w-4" />
                          Change Family Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member);
                            setIsRemoveDialogOpen(true);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove Member
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
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Change the role for{" "}
              {selectedMember?.user?.user_profiles?.full_name ||
                selectedMember?.user?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {userRole === "owner" && (
                  <SelectItem value="admin">Admin</SelectItem>
                )}
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-sm text-muted-foreground">
              {newRole === "admin"
                ? "Can manage group settings and members"
                : newRole === "member"
                ? "Can add transactions and view all data"
                : newRole === "viewer"
                ? "Can only view group data"
                : ""}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangeRoleDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={
                isLoading || !newRole || newRole === selectedMember?.role
              }
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              {selectedMember?.user?.user_profiles?.full_name ||
                selectedMember?.user?.email}{" "}
              from this group?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isLoading}
            >
              {isLoading ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Family Role Dialog */}
      <Dialog
        open={isFamilyRoleDialogOpen}
        onOpenChange={setIsFamilyRoleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Family Role</DialogTitle>
            <DialogDescription>
              Assign a family role to{" "}
              {selectedMember?.user?.user_profiles?.full_name ||
                selectedMember?.user?.email ||
                "this member"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select value={newFamilyRole} onValueChange={setNewFamilyRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a family role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="guardian">Guardian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="">None</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-sm text-muted-foreground">
              {newFamilyRole === "parent"
                ? "Full access to manage family finances and children's accounts"
                : newFamilyRole === "child"
                ? "Limited access based on parent settings"
                : newFamilyRole === "guardian"
                ? "Similar to parent but with some restrictions"
                : newFamilyRole === "other"
                ? "Custom role with specific permissions"
                : "No specific family role assigned"}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFamilyRoleDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeFamilyRole}
              disabled={
                isLoading ||
                newFamilyRole === (selectedMember?.family_role || "")
              }
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
