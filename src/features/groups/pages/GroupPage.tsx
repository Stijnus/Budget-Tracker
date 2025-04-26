import { useState, useEffect } from "react";
import { useGroupRealtime } from "../hooks/useGroupRealtime";
import { useParams, useNavigate } from "react-router-dom";
// Translation imports removed
import { useAuth } from "../../../state/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Card components are used in child components
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
  // Family role will be used in future updates
  const [, setUserFamilyRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Fetch group data
  const fetchGroupData = async () => {
    if (!user || !id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch group details
      const { data: groupData, error: groupError } = await getBudgetGroup(id);
      if (groupError) {
        console.error("Error fetching group details:", groupError);
        throw groupError;
      }
      if (!groupData) {
        console.error("Group not found");
        throw new Error("Group not found");
      }
      setGroup(groupData);
      
      // Fetch group members
      const { data: membersData, error: membersError } = await getGroupMembers(id);
      if (membersError) {
        console.error("Error fetching group members:", membersError);
        throw membersError;
      }
      setMembers((membersData || []) as unknown as GroupMember[]);
      
      // Get user's role in the group
      const { data: roleData, error: roleError } = await getUserRole(id, user.id);
      if (roleError) {
        console.error("Error fetching user role:", roleError);
        throw roleError;
      }
      setUserRole(roleData?.role || null);
      
      // Find the current user's member record to get family role
      const currentUserMember = membersData?.find(
        (member) => member.user_id === user.id
      );
      if (currentUserMember) {
        setUserFamilyRole(currentUserMember.family_role || null);
      }
      
      // Fetch group transactions
      const { data: transactionsData, error: transactionsError } = await getGroupTransactions(id);
      if (transactionsError) {
        console.error("Error fetching group transactions:", transactionsError);
        throw transactionsError;
      }
      setTransactions((transactionsData || []) as unknown as GroupTransaction[]);
      
      // Fetch group budgets
      const { data: budgetsData, error: budgetsError } = await getGroupBudgets(id);
      if (budgetsError) {
        console.error("Error fetching group budgets:", budgetsError);
        throw budgetsError;
      }
      
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
      setBudgets(convertedBudgets as unknown as GroupBudget[]);
      
      // Fetch group activity - non-critical, don't throw if it fails
      try {
        const activityResponse = await getGroupActivity(id);
        if (!activityResponse.error) {
          setActivity((activityResponse.data || []) as unknown as GroupActivity[]);
        } else {
          console.warn("Non-critical: Error fetching activity:", activityResponse.error);
        }
      } catch (activityErr) {
        console.warn("Non-critical: Exception fetching activity:", activityErr);
      }
      
      // Fetch transactions summary
      const { data: summaryData, error: summaryError } = await getGroupTransactionsSummary(id);
      if (summaryError) {
        console.error("Error fetching transactions summary:", summaryError);
        throw summaryError;
      }
      setSummary(summaryData);
    } catch (err) {
      console.error("Error fetching group data:", err);
      setError("Failed to load group data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [user, id]);

  // Real-time updates for group, members, and activity
  useGroupRealtime({
    groupId: id || "",
    onMembers: fetchGroupData,
    onActivity: fetchGroupData,
    onGroupInfo: fetchGroupData,
  });

  const handleInviteMember = async () => {
    // Refresh members after invitation
    try {
      const { data, error } = await getGroupMembers(id || "");
      if (error) throw error;
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
      const { data: transactionsData, error: transactionsError } = await getGroupTransactions(id || "");
      if (transactionsError) throw transactionsError;
      setTransactions((transactionsData || []) as unknown as GroupTransaction[]);

      const { data: summaryData, error: summaryError } = await getGroupTransactionsSummary(id || "");
      if (summaryError) throw summaryError;
      setSummary(summaryData);
    } catch (err) {
      console.error("Error refreshing transactions:", err);
      setError("Failed to refresh transactions. Please try again.");
    }
  };

  const handleBudgetChange = async () => {
    try {
      const { data: budgetsData, error: budgetsError } = await getGroupBudgets(id || "");
      if (budgetsError) throw budgetsError;

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

      setBudgets(convertedBudgets as unknown as GroupBudget[]);
    } catch (err) {
      console.error("Error refreshing budgets:", err);
      setError("Failed to refresh budgets. Please try again.");
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
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => fetchGroupData()}>Retry</Button>
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

      {/* Group Header */}
      <div className="relative rounded-xl overflow-hidden">
        {/* Banner with gradient background */}
        <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        
        {/* Group info overlay */}
        <div className="absolute -bottom-12 left-0 right-0 px-6">
          <div className="flex items-end">
            {/* Group avatar */}
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              {group?.avatar_url ? (
                <AvatarImage src={group.avatar_url} alt={group.name} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {group?.name?.substring(0, 2).toUpperCase() || "BG"}
                </AvatarFallback>
              )}
            </Avatar>
            
            {/* Group name and description */}
            <div className="ml-4 mb-2">
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                {group?.name}
              </h1>
              <p className="text-white/80 drop-shadow-md">
                {group?.description || "No description"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for the avatar overlap */}
      <div className="h-12"></div>

      {/* Group Info Card */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2">
              Created {new Date(group?.created_at || "").toLocaleDateString()}
            </Badge>
            {userRole && (
              <Badge className="bg-purple-500">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            )}
          </div>
          
          {summary && (
            <div className="flex gap-2 text-sm">
              <span className="text-green-600">
                Income: ${summary.totalIncome.toFixed(2)}
              </span>
              <span className="text-red-600">
                Expenses: ${summary.totalExpenses.toFixed(2)}
              </span>
              <span className="font-medium">
                Balance: ${summary.balance.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {isAdmin && (
          <Button
            onClick={() => setIsInviteDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

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
            <GroupSettings 
              // Using type assertion to satisfy the component props requirement
              group={group as unknown as import("../../../api/supabase/budgetGroups").BudgetGroup} 
              onUpdateGroup={handleUpdateGroup} 
            />
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
