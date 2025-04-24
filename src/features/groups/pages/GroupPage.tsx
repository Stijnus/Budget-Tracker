import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Translation imports removed
import { useAuth } from "../../../state/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Receipt,
  Settings,
  ArrowLeft,
  UserPlus,
  Calendar,
  Activity,
} from "lucide-react";
import {
  getBudgetGroup,
  getGroupMembers,
  getUserRole,
  getGroupActivity,
} from "../../../api/supabase/budgetGroups";
import {
  getGroupTransactions,
  getGroupTransactionsSummary,
} from "../../../api/supabase/groupTransactions";
import {
  getGroupBudgets,
} from "../../../api/supabase/groupBudgets";
import { GroupMembers } from "../components/GroupMembers";
import { GroupTransactions } from "../components/GroupTransactions";
import { GroupBudgets } from "../components/GroupBudgets";
import { GroupSettings } from "../components/GroupSettings";
import { GroupActivityFeed } from "../components/GroupActivityFeed";
import { InviteMemberDialog } from "../components/InviteMemberDialog";

// Define TypeScript interfaces for our data structures
interface BudgetGroup {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface GroupMember {
  group_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  family_role?: "parent" | "child" | "guardian" | "other" | null;
  joined_at: string;
  user: {
    id: string;
    email?: string;
    user_profiles?: {
      full_name?: string | null;
      avatar_url?: string | null;
    } | null;
  } | null;
}

interface GroupTransaction {
  id: string;
  group_id: string;
  created_by: string;
  category_id: string | null;
  amount: number;
  description: string | null;
  date: string;
  type: "expense" | "income";
  payment_method: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

// Use the canonical GroupBudget type from the API
import type { GroupBudget } from "@/api/supabase/groupBudgets";
// No local extension of GroupBudget needed; use as-is from API

interface GroupActivity {
  id: string;
  group_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  user: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export function GroupPage() {
  // Translation hooks removed
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<BudgetGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [transactions, setTransactions] = useState<GroupTransaction[]>([]);
  const [budgets, setBudgets] = useState<GroupBudget[]>([]);
  const [activity, setActivity] = useState<GroupActivity[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userFamilyRole, setUserFamilyRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchGroupData() {
      if (!user || !id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch group details
        console.log("Fetching group details for ID:", id);
        const { data: groupData, error: groupError } = await getBudgetGroup(id);

        if (groupError) {
          console.error("Error fetching group details:", groupError);
          throw groupError;
        }
        if (!groupData) {
          console.error("Group not found");
          throw new Error("Group not found");
        }

        console.log("Group data received:", groupData);
        setGroup(groupData);

        // Fetch group members
        console.log("Fetching group members");
        const { data: membersData, error: membersError } =
          await getGroupMembers(id);

        if (membersError) {
          console.error("Error fetching group members:", membersError);
          throw membersError;
        }

        console.log("Group members received:", membersData);
        // Type assertion to handle API response
        setMembers((membersData || []) as unknown as GroupMember[]);

        // Get user's role in the group
        console.log("Fetching user role");
        const { data: roleData, error: roleError } = await getUserRole(
          id,
          user.id
        );

        if (roleError) {
          console.error("Error fetching user role:", roleError);
          throw roleError;
        }

        console.log("User role received:", roleData);
        setUserRole(roleData?.role || null);

        // Find the current user's member record to get family role
        const currentUserMember = membersData?.find(
          (member) => member.user_id === user.id
        );
        if (currentUserMember) {
          setUserFamilyRole(currentUserMember.family_role || null);
          console.log("User family role:", currentUserMember.family_role);
        }

        // Fetch group transactions
        console.log("Fetching group transactions");
        const { data: transactionsData, error: transactionsError } =
          await getGroupTransactions(id);

        if (transactionsError) {
          console.error(
            "Error fetching group transactions:",
            transactionsError
          );
          throw transactionsError;
        }

        console.log("Group transactions received:", transactionsData);
        // Type assertion to handle API response
        setTransactions(
          (transactionsData || []) as unknown as GroupTransaction[]
        );

        // Fetch group budgets
        console.log("Fetching group budgets");
        const { data: budgetsData, error: budgetsError } =
          await getGroupBudgets(id);

        if (budgetsError) {
          console.error("Error fetching group budgets:", budgetsError);
          throw budgetsError;
        }

        console.log("Group budgets received:", budgetsData);
        // Convert API type to component type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const convertedBudgets = (budgetsData || []).map((budget: any) => ({
          ...budget,
          category: budget.category
            ? {
                id: budget.category.id,
                name: budget.category.name,
                type: budget.category.type || "expense",
                color: budget.category.color || "#000000",
              }
            : null,
          creator: budget.creator || null,
        }));

        // Set the budgets with the converted data
        setBudgets(convertedBudgets as unknown as GroupBudget[]);

        // Fetch group activity
        console.log("Fetching group activity");
        try {
          const { data: activityData, error: activityError } =
            await getGroupActivity(id);

          if (activityError) {
            console.error("Error fetching group activity:", activityError);
            // Don't throw, just log the error and continue
            console.warn("Continuing without activity data");
          } else {
            console.log("Group activity received:", activityData);
            // Type assertion to handle API response
            setActivity((activityData || []) as unknown as GroupActivity[]);
          }
        } catch (activityErr) {
          console.error("Exception fetching group activity:", activityErr);
          // Don't throw, just log the error and continue
          console.warn("Continuing without activity data");
        }

        // Fetch transactions summary
        console.log("Fetching transactions summary");
        const { data: summaryData, error: summaryError } =
          await getGroupTransactionsSummary(id);

        if (summaryError) {
          console.error("Error fetching transactions summary:", summaryError);
          throw summaryError;
        }

        console.log("Transactions summary received:", summaryData);
        setSummary(summaryData);
      } catch (err) {
        console.error("Error fetching group data:", err);
        setError("Failed to load group data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGroupData();
  }, [user, id]);

  const handleInviteMember = async () => {
    // Refresh members after invitation
    try {
      const { data, error } = await getGroupMembers(id || "");

      if (error) throw error;

      // Type assertion to handle API response
      setMembers((data || []) as unknown as GroupMember[]);
      setIsInviteDialogOpen(false);
    } catch (err) {
      console.error("Error refreshing members:", err);
      setError("Failed to refresh members. Please try again.");
    }
  };

  const handleUpdateGroup = async (updatedGroup: BudgetGroup) => {
    setGroup(updatedGroup);
  };

  const handleTransactionChange = async () => {
    try {
      // Refresh transactions
      const { data: transactionsData, error: transactionsError } =
        await getGroupTransactions(id || "");

      if (transactionsError) throw transactionsError;

      // Type assertion to handle API response
      setTransactions(
        (transactionsData || []) as unknown as GroupTransaction[]
      );

      // Refresh summary
      const { data: summaryData, error: summaryError } =
        await getGroupTransactionsSummary(id || "");

      if (summaryError) throw summaryError;

      setSummary(summaryData);

      // Refresh activity
      try {
        const { data: activityData, error: activityError } =
          await getGroupActivity(id || "");

        if (activityError) {
          console.warn("Error refreshing activity data:", activityError);
          // Don't throw, just log the error and continue
        } else {
          // Type assertion to handle API response
          setActivity((activityData || []) as unknown as GroupActivity[]);
        }
      } catch (activityErr) {
        console.warn("Exception refreshing activity data:", activityErr);
        // Don't throw, just log the error and continue
      }
    } catch (err) {
      console.error("Error refreshing data after transaction change:", err);
      setError("Failed to refresh data. Please try again.");
    }
  };

  const handleBudgetChange = async () => {
    try {
      // Refresh budgets
      const { data: budgetsData, error: budgetsError } = await getGroupBudgets(
        id || ""
      );

      if (budgetsError) throw budgetsError;

      // Type assertion to handle API response
      setBudgets((budgetsData || []) as unknown as GroupBudget[]);

      // Refresh activity
      try {
        const { data: activityData, error: activityError } =
          await getGroupActivity(id || "");

        if (activityError) {
          console.warn("Error refreshing activity data:", activityError);
          // Don't throw, just log the error and continue
        } else {
          // Type assertion to handle API response
          setActivity((activityData || []) as unknown as GroupActivity[]);
        }
      } catch (activityErr) {
        console.warn("Exception refreshing activity data:", activityErr);
        // Don't throw, just log the error and continue
      }
    } catch (err) {
      console.error("Error refreshing data after budget change:", err);
      setError("Failed to refresh data. Please try again.");
    }
  };

  const isAdmin = userRole === "owner" || userRole === "admin";

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/groups")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {"Back"}
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/groups")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {"Back"}
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Group not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/groups")}>{"GoBack"}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/groups")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {"Back"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {group.avatar_url && (
              <AvatarImage src={group.avatar_url} alt={group.name} />
            )}
            <AvatarFallback>
              {group.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              {group.name}
              {!group.is_active && (
                <Badge variant="outline" className="ml-2">
                  Inactive
                </Badge>
              )}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">{group.description}</p>
              {userRole && (
                <Badge variant="secondary" className="ml-1">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              )}
              {userFamilyRole && (
                <Badge variant="outline" className="ml-1 bg-blue-50">
                  {userFamilyRole.charAt(0).toUpperCase() +
                    userFamilyRole.slice(1)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summary.totalIncome.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summary.totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summary.balance >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                ${summary.balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="transactions">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="transactions">
            <Receipt className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Transactions</span>
            <span className="md:hidden">Trans</span>
          </TabsTrigger>
          <TabsTrigger value="budgets">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Budgets</span>
            <span className="md:hidden">Budg</span>
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Members</span>
            <span className="md:hidden">Memb</span>
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Activity</span>
            <span className="md:hidden">Act</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Settings</span>
              <span className="md:hidden">Set</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <GroupTransactions
            groupId={id || ""}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transactions={transactions as any}
            userRole={userRole || ""}
            onChange={handleTransactionChange}
          />
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <GroupBudgets
            groupId={id || ""}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            budgets={budgets as any}
            userRole={userRole || ""}
            onChange={handleBudgetChange}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <GroupMembers
            groupId={id || ""}
            members={members}
            userRole={userRole || ""}
            currentUserId={user?.id || ""}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <GroupActivityFeed groupId={id || ""} activity={activity} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings" className="mt-6">
            <GroupSettings group={group} onUpdateGroup={handleUpdateGroup} />
          </TabsContent>
        )}
      </Tabs>

      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        groupId={id || ""}
        onInvite={handleInviteMember}
      />
    </div>
  );
}
