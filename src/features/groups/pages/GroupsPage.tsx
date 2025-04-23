import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../state/useAuth";
import { PageHeader } from "../../../shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Users, UserPlus } from "lucide-react";
import { GroupList } from "../components/GroupList";
import { GroupInvitationsList } from "../components/GroupInvitationsList";
import { CreateGroupDialog } from "../components/CreateGroupDialog";
import { getBudgetGroups } from "../../../api/supabase/budgetGroups";
import { getInvitationsByEmail } from "../../../api/supabase/budgetGroups";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Import types from the API
import type {
  BudgetGroup,
  GroupInvitation,
} from "../../../api/supabase/budgetGroups";

// Define component-specific types that match the component interfaces
interface Group extends BudgetGroup {
  role: string;
}

interface Invitation extends Omit<GroupInvitation, "role" | "status"> {
  role: "admin" | "member" | "viewer";
  status: "pending" | "accepted" | "rejected" | "expired";
  group?: {
    id: string;
    name: string;
    description: string | null;
    avatar_url: string | null;
  };
  inviter?: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

export function GroupsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        console.log("No user found, skipping data fetch");
        return;
      }

      console.log("Fetching data for user:", user.id);
      setIsLoading(true);
      setError(null);

      try {
        // Fetch user's groups
        console.log("Fetching budget groups...");
        const { data: groupsData, error: groupsError } =
          await getBudgetGroups();

        if (groupsError) {
          console.error("Error fetching budget groups:", groupsError);
          setError(
            `Failed to load groups: ${
              groupsError.message || "Please try again."
            }`
          );
          setGroups([]);
        } else {
          console.log("Groups data received:", groupsData);
          setGroups(groupsData || []);
        }

        // Fetch invitations for the user's email
        console.log("Fetching invitations for email:", user.email);
        const { data: invitationsData, error: invitationsError } =
          await getInvitationsByEmail(user.email || "");

        if (invitationsError) {
          console.error("Error fetching invitations:", invitationsError);
          // Don't set error here, just log it and continue
          setInvitations([]);
        } else {
          console.log("Invitations data received:", invitationsData);
          // Type assertion to handle API response
          setInvitations((invitationsData || []) as unknown as Invitation[]);
        }
      } catch (err) {
        console.error("Error fetching groups data:", err);
        setError(
          `Failed to load groups: ${
            (err as Error).message || "Please try again."
          }`
        );
        setGroups([]);
        setInvitations([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // The newGroup parameter is not used because we refresh from the server
  const handleCreateGroup = async () => {
    try {
      console.log("Group created, refreshing groups list...");
      setIsLoading(true);

      // Refresh the groups list after creating a new group
      const { data, error } = await getBudgetGroups();

      if (error) {
        console.error("Error refreshing groups:", error);
        setError(
          `Failed to refresh groups: ${error.message || "Please try again."}`
        );
      } else {
        console.log("Groups refreshed successfully:", data);
        setGroups(data || []);
        setIsCreateDialogOpen(false);
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      console.error("Error refreshing groups:", err);
      setError(
        `Failed to refresh groups: ${
          (err as Error).message || "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      // Refresh invitations
      const { data: invitationsData, error: invitationsError } =
        await getInvitationsByEmail(user?.email || "");

      if (invitationsError) throw invitationsError;

      // Type assertion to handle API response
      setInvitations((invitationsData || []) as unknown as Invitation[]);

      // Refresh groups
      const { data: groupsData, error: groupsError } = await getBudgetGroups();

      if (groupsError) throw groupsError;

      setGroups(groupsData || []);
    } catch (err) {
      console.error("Error refreshing data after accepting invitation:", err);
      setError("Failed to refresh data. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={t("groups.title")}
        description={t("groups.description")}
        action={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("groups.createGroup")}
          </Button>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="my-groups">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my-groups">
            <Users className="mr-2 h-4 w-4" />
            {t("groups.myGroups")}
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <UserPlus className="mr-2 h-4 w-4" />
            {t("groups.invitations")}
            {invitations.length > 0 && (
              <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {invitations.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : groups.length > 0 ? (
            <GroupList groups={groups} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t("groups.noGroups")}</CardTitle>
                <CardDescription>
                  {t("groups.noGroupsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("groups.createGroupPrompt")}
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("groups.createGroup")}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : invitations.length > 0 ? (
            <GroupInvitationsList
              invitations={invitations}
              onAccept={handleAcceptInvitation}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t("groups.noInvitations")}</CardTitle>
                <CardDescription>
                  {t("groups.noInvitationsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("groups.invitationPrompt")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}
