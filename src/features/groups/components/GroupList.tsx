// Translation imports removed
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { EditGroupDialog } from "./EditGroupDialog";
import { deleteBudgetGroup } from "../../../api/supabase/budgetGroups";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, ArrowRight } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_active: boolean;
  role: string;
}

interface GroupListProps {
  groups: Group[];
}

export function GroupList({ groups }: GroupListProps) {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = (groupId: string) => {
    setEditGroupId(groupId);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (groupId: string) => {
    setGroupToDelete(groupId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;
    setLoadingDelete(true);
    setError(null);
    const { error } = await deleteBudgetGroup(groupToDelete);
    setLoadingDelete(false);
    setDeleteConfirmOpen(false);
    setGroupToDelete(null);
    if (error) {
      setError("Failed to delete group");
    } else {
      window.location.reload(); // Or trigger a refresh in parent if possible
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <Card
          key={group.id}
          className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar className="border-2 border-blue-100">
                  {group.avatar_url && (
                    <AvatarImage src={group.avatar_url} alt={group.name} />
                  )}
                  <AvatarFallback className="bg-blue-50 text-blue-700">
                    {group.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                      {group.role.charAt(0).toUpperCase() + group.role.slice(1)}
                    </Badge>
                    {!group.is_active && (
                      <Badge
                        variant="outline"
                        className="text-gray-500 border-gray-300"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <CardDescription className="line-clamp-2 mt-2">
              {group.description || "No description available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4 text-blue-500" />
              <span>0 members</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="flex gap-2 w-full mb-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Edit Group"
                onClick={() => handleEditClick(group.id)}
                className="flex-1"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Delete Group"
                onClick={() => handleDeleteClick(group.id)}
                className="flex-1 text-destructive hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
            <Button
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              View Group
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
    {/* Edit Group Dialog */}
    {editGroupId && (
      <EditGroupDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        groupId={editGroupId || ""}
        onEditGroup={() => window.location.reload()} // Or trigger a refresh in parent if possible
      />
    )}
    {/* Delete Confirmation Dialog */}
    {deleteConfirmOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
          <h2 className="text-lg font-semibold mb-2">Delete Group?</h2>
          <p className="mb-4">Are you sure you want to delete this group? This action cannot be undone.</p>
          {error && (
            <div className="text-red-600 mb-2 text-sm">{error}</div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={loadingDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loadingDelete}>
              {loadingDelete ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

