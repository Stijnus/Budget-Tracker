import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../state/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Receipt,
  Settings,
  ArrowLeft,
  UserPlus,
  Calendar,
  Activity,
} from "lucide-react";

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

type SelectQueryError<T> = any; // Helper type for Supabase query errors

interface GroupMember {
  group_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  joined_at: string;
  user: any; // Using any for now due to SelectQueryError
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
  creator?: any; // Using any for now due to SelectQueryError
}

interface GroupBudget {
  id: string;
  group_id: string;
  created_by: string;
  category_id: string;
  name: string;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  category?: any; // Using any for now due to SelectQueryError
  creator?: any; // Using any for now due to SelectQueryError
}

type Json = any; // Helper type for JSON data

interface GroupActivity {
  id: string;
  group_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Json;
  created_at: string;
  user: any; // Using any for now due to SelectQueryError
}

interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}
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
import { getGroupBudgets } from "../../../api/supabase/groupBudgets";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupMembers } from "../components/GroupMembers";
import { GroupTransactions } from "../components/GroupTransactions";
import { GroupBudgets } from "../components/GroupBudgets";
import { GroupSettings } from "../components/GroupSettings";
import { GroupActivityFeed } from "../components/GroupActivityFeed";
import { InviteMemberDialog } from "../components/InviteMemberDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function GroupPage() {
  const { t } = useTranslation();
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
        const { data: groupData, error: groupError } = await getBudgetGroup(id);

        if (groupError) throw groupError;
        if (!groupData) throw new Error("Group not found");

        setGroup(groupData);

        // Fetch group members
        const { data: membersData, error: membersError } =
          await getGroupMembers(id);

        if (membersError) throw membersError;

        setMembers(membersData || []);

        // Get user's role in the group
        const { data: roleData, error: roleError } = await getUserRole(
          id,
          user.id
        );

        if (roleError) throw roleError;

        setUserRole(roleData?.role || null);

        // Fetch group transactions
        const { data: transactionsData, error: transactionsError } =
          await getGroupTransactions(id);

        if (transactionsError) throw transactionsError;

        setTransactions(transactionsData || []);

        // Fetch group budgets
        const { data: budgetsData, error: budgetsError } =
          await getGroupBudgets(id);

        if (budgetsError) throw budgetsError;

        setBudgets(budgetsData || []);

        // Fetch group activity
        const { data: activityData, error: activityError } =
          await getGroupActivity(id);

        if (activityError) throw activityError;

        setActivity(activityData || []);

        // Fetch transactions summary
        const { data: summaryData, error: summaryError } =
          await getGroupTransactionsSummary(id);

        if (summaryError) throw summaryError;

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

      setMembers(data || []);
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

      setTransactions(transactionsData || []);

      // Refresh summary
      const { data: summaryData, error: summaryError } =
        await getGroupTransactionsSummary(id || "");

      if (summaryError) throw summaryError;

      setSummary(summaryData);

      // Refresh activity
      const { data: activityData, error: activityError } =
        await getGroupActivity(id || "");

      if (activityError) throw activityError;

      setActivity(activityData || []);
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

      setBudgets(budgetsData || []);

      // Refresh activity
      const { data: activityData, error: activityError } =
        await getGroupActivity(id || "");

      if (activityError) throw activityError;

      setActivity(activityData || []);
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
            {t("common.back")}
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
            {t("common.back")}
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Group not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/groups")}>
          {t("common.goBack")}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/groups")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
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
                  {t("groups.inactive")}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">{group.description}</p>
          </div>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t("groups.inviteMember")}
          </Button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {t("groups.totalIncome")}
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
                {t("groups.totalExpenses")}
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
              <CardTitle className="text-sm font-medium">
                {t("groups.balance")}
              </CardTitle>
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
            <span className="hidden md:inline">{t("groups.transactions")}</span>
            <span className="md:hidden">{t("groups.transactionsShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="budgets">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t("groups.budgets")}</span>
            <span className="md:hidden">{t("groups.budgetsShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t("groups.members")}</span>
            <span className="md:hidden">{t("groups.membersShort")}</span>
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t("groups.activity")}</span>
            <span className="md:hidden">{t("groups.activityShort")}</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t("groups.settings")}</span>
              <span className="md:hidden">{t("groups.settingsShort")}</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <GroupTransactions
            groupId={id || ""}
            transactions={transactions}
            userRole={userRole || ""}
            onChange={handleTransactionChange}
          />
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <GroupBudgets
            groupId={id || ""}
            budgets={budgets}
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
