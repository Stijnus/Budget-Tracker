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

// Define proper types for groups and invitations
interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  role: string;
}

interface Invitation {
  id: string;
  group_id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
  updated_at?: string;
  group?: {
    id: string;
    name: string;
    description: string | null;
    avatar_url: string | null;
  };
  inviter?: any; // Using any for now due to Supabase query error
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
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch user's groups
        const { data: groupsData, error: groupsError } =
          await getBudgetGroups();

        if (groupsError) {
          console.error("Error fetching budget groups:", groupsError);
          setError("Failed to load groups. Please try again.");
          setGroups([]);
        } else {
          setGroups(groupsData || []);
        }

        // Fetch invitations for the user's email
        const { data: invitationsData, error: invitationsError } =
          await getInvitationsByEmail(user.email || "");

        if (invitationsError) {
          console.error("Error fetching invitations:", invitationsError);
          // Don't set error here, just log it and continue
          setInvitations([]);
        } else {
          setInvitations(invitationsData || []);
        }
      } catch (err) {
        console.error("Error fetching groups data:", err);
        setError("Failed to load groups. Please try again.");
        setGroups([]);
        setInvitations([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleCreateGroup = async (_newGroup: Group) => {
    try {
      // Refresh the groups list after creating a new group
      const { data, error } = await getBudgetGroups();

      if (error) {
        console.error("Error refreshing groups:", error);
        setError("Failed to refresh groups. Please try again.");
      } else {
        setGroups(data || []);
        setIsCreateDialogOpen(false);
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      console.error("Error refreshing groups:", err);
      setError("Failed to refresh groups. Please try again.");
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      // Refresh invitations
      const { data: invitationsData, error: invitationsError } =
        await getInvitationsByEmail(user?.email || "");

      if (invitationsError) throw invitationsError;

      setInvitations(invitationsData || []);

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
