import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../state/useAuth";
import { AppLayout } from "../shared/components/layout";
import { GroupTransactions } from "../features/groups/components/GroupTransactions";
import { GroupBudgets } from "../features/groups/components/GroupBudgets";
import { GroupMembers } from "../features/groups/components/GroupMembers";
import { GroupActivityFeed } from "../features/groups/components/GroupActivityFeed";
import { formatDate } from "../utils/formatters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  Bell,
  Target,
  PieChart,
  ArrowRight,
  Users,
  Receipt,
  Settings,
  ArrowLeft,
  Calendar,
  Activity,
  Home,
  AlertCircle,
} from "lucide-react";
import {
  getBudgetGroup,
  getGroupMembers,
  getUserRole,
  getGroupActivity,
  getBudgetGroups,
} from "../api/supabase/budgetGroups";
import {
  getGroupTransactions,
  getGroupTransactionsSummary,
} from "../api/supabase/groupTransactions";
import {
  getGroupBudgets,
  type GroupBudget as ApiGroupBudget,
} from "../api/supabase/groupBudgets";

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
  role?: string;
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

// Use the API type and extend it for our component
type GroupBudget = ApiGroupBudget & {
  category?: {
    id: string;
    name: string;
    color: string;
  } | null;
  creator?: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
};

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

export function GroupDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<BudgetGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [group, setGroup] = useState<BudgetGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [transactions, setTransactions] = useState<GroupTransaction[]>([]);
  const [budgets, setBudgets] = useState<GroupBudget[]>([]);
  const [activity, setActivity] = useState<GroupActivity[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all user's groups
  useEffect(() => {
    async function fetchGroups() {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await getBudgetGroups();

        if (error) {
          throw new Error(error.message);
        }

        // Sort groups by most recently updated
        const sortedGroups = (data || []).sort(
          (a: BudgetGroup, b: BudgetGroup) => {
            return (
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
            );
          }
        );

        setGroups(sortedGroups);

        // If id is provided in URL, use that as selected group
        if (id) {
          setSelectedGroupId(id);
        }
        // Otherwise use the first group if available
        else if (sortedGroups.length > 0) {
          setSelectedGroupId(sortedGroups[0].id);
        }
      } catch (err) {
        console.error("Error fetching budget groups:", err);
        setError("Failed to load budget groups");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGroups();
  }, [user, id]);

  // Fetch selected group data
  useEffect(() => {
    async function fetchGroupData() {
      if (!user || !selectedGroupId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch group details
        console.log("Fetching group details for ID:", selectedGroupId);
        const { data: groupData, error: groupError } = await getBudgetGroup(
          selectedGroupId
        );

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
          await getGroupMembers(selectedGroupId);

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
          selectedGroupId,
          user.id
        );

        if (roleError) {
          console.error("Error fetching user role:", roleError);
          throw roleError;
        }

        console.log("User role received:", roleData);
        setUserRole(roleData?.role || null);

        // Fetch group transactions
        console.log("Fetching group transactions");
        const { data: transactionsData, error: transactionsError } =
          await getGroupTransactions(selectedGroupId);

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
          await getGroupBudgets(selectedGroupId);

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
            await getGroupActivity(selectedGroupId);

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
          await getGroupTransactionsSummary(selectedGroupId);

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
  }, [user, selectedGroupId]);

  const handleTransactionChange = async () => {
    if (!selectedGroupId) return;

    try {
      // Refresh transactions
      const { data: transactionsData, error: transactionsError } =
        await getGroupTransactions(selectedGroupId);

      if (transactionsError) throw transactionsError;

      // Type assertion to handle API response
      setTransactions(
        (transactionsData || []) as unknown as GroupTransaction[]
      );

      // Refresh summary
      const { data: summaryData, error: summaryError } =
        await getGroupTransactionsSummary(selectedGroupId);

      if (summaryError) throw summaryError;

      setSummary(summaryData);

      // Refresh activity
      try {
        const { data: activityData, error: activityError } =
          await getGroupActivity(selectedGroupId);

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
    if (!selectedGroupId) return;

    try {
      // Refresh budgets
      const { data: budgetsData, error: budgetsError } = await getGroupBudgets(
        selectedGroupId
      );

      if (budgetsError) throw budgetsError;

      // Type assertion to handle API response
      setBudgets((budgetsData || []) as unknown as GroupBudget[]);

      // Refresh activity
      try {
        const { data: activityData, error: activityError } =
          await getGroupActivity(selectedGroupId);

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

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    // Update URL without reloading the page
    navigate(`/group-dashboard/${groupId}`, { replace: true });
  };

  const isAdmin = userRole === "owner" || userRole === "admin";

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-48" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (groups.length === 0) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Household Dashboard
            </h1>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Personal Dashboard
            </Button>
          </div>

          <Card className="p-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">No Budget Groups Found</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have any budget groups yet. Create a group to start
                managing household finances together.
              </p>
              <Button onClick={() => navigate("/groups/new")} size="lg">
                Create a Budget Group
              </Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error || !group) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Household Dashboard
            </h1>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Personal Dashboard
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Failed to load group data"}
            </AlertDescription>
          </Alert>

          <Button onClick={() => navigate("/groups")}>View All Groups</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with group selector and tabs */}
        <Card className="p-5 bg-gradient-to-r from-slate-50 to-slate-100 border-none shadow-md mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                  {group.avatar_url && (
                    <AvatarImage src={group.avatar_url} alt={group.name} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {group.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedGroupId || ""}
                      onValueChange={handleGroupChange}
                    >
                      <SelectTrigger className="w-[220px] border-none shadow-none p-0 h-auto text-2xl font-bold focus:ring-0">
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                      <SelectContent className="border-2">
                        {groups.map((g) => (
                          <SelectItem
                            key={g.id}
                            value={g.id}
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                {g.avatar_url && (
                                  <AvatarImage
                                    src={g.avatar_url}
                                    alt={g.name}
                                  />
                                )}
                                <AvatarFallback>
                                  {g.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{g.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {userRole && (
                      <Badge
                        variant="secondary"
                        className="ml-1 px-3 py-1 text-sm font-medium"
                      >
                        {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {formatDate(new Date(), "long")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => navigate(`/groups/${selectedGroupId}`)}
                variant="outline"
                className="gap-2 border-slate-300 hover:bg-slate-200"
              >
                <Settings className="h-4 w-4" />
                Group Settings
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="gap-2 border-slate-300 hover:bg-slate-200"
              >
                <Home className="h-4 w-4" />
                Personal Dashboard
              </Button>
            </div>
          </div>
        </Card>

        {/* Dashboard tabs */}
        <Card className="p-2 border-none shadow-sm bg-slate-50">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-white border shadow-sm">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
              <TabsTrigger
                value="budgets"
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <PiggyBank className="h-4 w-4" />
                <span className="hidden sm:inline">Budgets</span>
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Financial summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden border-l-4 border-l-green-500 bg-gradient-to-br from-green-50/50 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-green-500" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-3xl font-bold text-green-600">
                  ${summary.totalIncome.toFixed(2)}
                </div>
                <div className="mt-3">
                  <Progress
                    value={summary.totalIncome > 0 ? 100 : 0}
                    className="h-2 bg-green-100"
                    indicatorClassName="bg-green-500"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Current month
              </CardFooter>
            </Card>
            <Card className="overflow-hidden border-l-4 border-l-red-500 bg-gradient-to-br from-red-50/50 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-red-500" />
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-3xl font-bold text-red-600">
                  ${summary.totalExpenses.toFixed(2)}
                </div>
                <div className="mt-3">
                  <Progress
                    value={summary.totalExpenses > 0 ? 100 : 0}
                    className="h-2 bg-red-100"
                    indicatorClassName="bg-red-500"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Current month
              </CardFooter>
            </Card>
            <Card
              className={`overflow-hidden border-l-4 ${
                summary.balance >= 0
                  ? "border-l-green-500 bg-gradient-to-br from-green-50/50 to-transparent"
                  : "border-l-red-500 bg-gradient-to-br from-red-50/50 to-transparent"
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {summary.balance >= 0 ? (
                    <ArrowUpCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 text-red-500" />
                  )}
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div
                  className={`text-3xl font-bold ${
                    summary.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${summary.balance.toFixed(2)}
                </div>
                <div className="mt-3">
                  {summary.totalIncome > 0 && (
                    <Progress
                      value={Math.min(
                        100,
                        (summary.balance / summary.totalIncome) * 100
                      )}
                      className="h-2 bg-gray-100"
                      indicatorClassName={
                        summary.balance >= 0 ? "bg-green-500" : "bg-red-500"
                      }
                    />
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-3 text-xs text-muted-foreground flex justify-between">
                <div>
                  <Calendar className="h-3 w-3 mr-1 inline" />
                  Current month
                </div>
                <div>
                  {summary.totalIncome > 0 && (
                    <span className="font-medium">
                      {Math.round(
                        (summary.balance / summary.totalIncome) * 100
                      )}
                      % of income
                    </span>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Tab content */}
        <div>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card className="border-t-4 border-t-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Receipt className="mr-2 h-5 w-5 text-blue-500" />
                      Recent Transactions
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => setActiveTab("transactions")}
                    >
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <GroupTransactions
                      groupId={selectedGroupId || ""}
                      transactions={transactions.slice(0, 5) as any}
                      userRole={userRole || ""}
                      onChange={handleTransactionChange}
                      compact={true}
                    />
                  </CardContent>
                </Card>

                {/* Group Budgets */}
                <Card className="border-t-4 border-t-amber-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <PiggyBank className="mr-2 h-5 w-5 text-amber-500" />
                      Budget Progress
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                      onClick={() => setActiveTab("budgets")}
                    >
                      View All
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <GroupBudgets
                      groupId={selectedGroupId || ""}
                      budgets={budgets.slice(0, 3) as any}
                      userRole={userRole || ""}
                      onChange={handleBudgetChange}
                      compact={true}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Group Members */}
              <Card className="border-t-4 border-t-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="mr-2 h-5 w-5 text-purple-500" />
                    Group Members
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => setActiveTab("members")}
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <GroupMembers
                    groupId={selectedGroupId || ""}
                    members={members}
                    userRole={userRole || ""}
                    currentUserId={user?.id || ""}
                    compact={true}
                  />
                </CardContent>
              </Card>

              {/* Recent Activity */}
              {activity.length > 0 && (
                <Card className="border-t-4 border-t-emerald-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-emerald-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GroupActivityFeed
                      groupId={selectedGroupId || ""}
                      activity={activity.slice(0, 5)}
                      compact={true}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <Card className="border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Receipt className="mr-2 h-5 w-5 text-blue-500" />
                  Group Transactions
                </CardTitle>
                <CardDescription>
                  Manage all transactions for {group.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GroupTransactions
                  groupId={selectedGroupId || ""}
                  transactions={transactions as any}
                  userRole={userRole || ""}
                  onChange={handleTransactionChange}
                />
              </CardContent>
            </Card>
          )}

          {/* Budgets Tab */}
          {activeTab === "budgets" && (
            <Card className="border-t-4 border-t-amber-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PiggyBank className="mr-2 h-5 w-5 text-amber-500" />
                  Group Budgets
                </CardTitle>
                <CardDescription>
                  Track and manage budget allocations for {group.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GroupBudgets
                  groupId={selectedGroupId || ""}
                  budgets={budgets as any}
                  userRole={userRole || ""}
                  onChange={handleBudgetChange}
                />
              </CardContent>
            </Card>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <Card className="border-t-4 border-t-purple-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-purple-500" />
                  Group Members
                </CardTitle>
                <CardDescription>
                  Manage members and permissions for {group.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GroupMembers
                  groupId={selectedGroupId || ""}
                  members={members}
                  userRole={userRole || ""}
                  currentUserId={user?.id || ""}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
