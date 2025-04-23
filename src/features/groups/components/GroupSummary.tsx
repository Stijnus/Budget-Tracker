import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getBudgetGroups,
  getGroupActivity,
} from "../../../api/supabase/budgetGroups";
import { formatDate } from "../../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowRight, Users, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GroupSummaryProps {
  limit?: number;
}

interface GroupData {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_by: string;
  updated_at: string;
  created_at: string;
  role?: string;
}

interface ActivityData {
  id: string;
  group_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: {
    type?: string;
    name?: string;
    user_id?: string;
    group_name?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  created_at: string;
  user?: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

export function GroupSummary({ limit = 3 }: GroupSummaryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        setIsLoading(true);
        const { data, error } = await getBudgetGroups();

        if (error) {
          throw new Error(error.message);
        }

        // Sort groups by most recently updated
        const sortedGroups = (data || []).sort((a: GroupData, b: GroupData) => {
          return (
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        });

        // Limit the number of groups to display
        const limitedGroups = sortedGroups.slice(0, limit);
        setGroups(limitedGroups);

        // Fetch recent activity for the first group if available
        if (limitedGroups.length > 0) {
          fetchGroupActivity(limitedGroups[0].id);
        }
      } catch (err) {
        console.error("Error fetching budget groups:", err);
        setError("Failed to load budget groups");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGroups();
  }, [limit]);

  async function fetchGroupActivity(groupId: string) {
    try {
      const { data, error } = await getGroupActivity(groupId, 3);

      if (error) {
        console.warn("Error fetching group activity:", error);
        return;
      }

      setRecentActivity((data || []) as ActivityData[]);
    } catch (err) {
      console.warn("Error fetching group activity:", err);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5" />
            {t("groups.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-4">{t("groups.noGroups")}</p>
          <Button onClick={() => navigate("/groups")}>
            {t("groups.createGroup")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <Users className="mr-2 h-5 w-5" />
          {t("groups.myGroups")}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => navigate("/groups")}
        >
          {t("common.viewAll")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {group.avatar_url && (
                    <AvatarImage src={group.avatar_url} alt={group.name} />
                  )}
                  <AvatarFallback>
                    {group.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{group.name}</h4>
                    {!group.is_active && (
                      <Badge variant="outline" className="ml-1">
                        {t("groups.inactive")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {group.description || t("groups.noDescription")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => navigate(`/groups/${group.id}`)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recentActivity.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center mb-2">
            <Activity className="mr-2 h-5 w-5" />
            <h3 className="text-lg font-medium">{t("groups.activity")}</h3>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
              {recentActivity.map((item) => {
                const userName =
                  item.user?.user_profiles?.full_name ||
                  item.user?.id ||
                  "Unknown user";
                let message = "";

                if (item.entity_type === "transaction") {
                  message = `${userName} ${item.action} a ${
                    item.details?.type || ""
                  } transaction`;
                } else if (item.entity_type === "budget") {
                  message = `${userName} ${item.action} a budget "${
                    item.details?.name || ""
                  }"`;
                } else if (item.entity_type === "member") {
                  message = `${userName} ${item.action.replace("_", " ")} ${
                    item.details?.user_id || ""
                  }`;
                } else {
                  message = `${userName} ${item.action} a ${item.entity_type}`;
                }

                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      {item.user?.user_profiles?.avatar_url && (
                        <AvatarImage
                          src={item.user.user_profiles.avatar_url}
                          alt={userName}
                        />
                      )}
                      <AvatarFallback>
                        {userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(new Date(item.created_at), "short")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
