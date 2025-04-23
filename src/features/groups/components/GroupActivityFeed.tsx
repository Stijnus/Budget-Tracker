import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Activity,
  Receipt,
  Calendar,
  UserPlus,
  UserMinus,
  Settings,
  Edit,
} from "lucide-react";

interface GroupActivity {
  id: string;
  group_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  user?: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

interface GroupActivityFeedProps {
  groupId: string; // Not used but kept for API consistency
  activity: GroupActivity[];
}

export function GroupActivityFeed({
  // groupId is not used but kept for API consistency
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  groupId,
  activity,
}: GroupActivityFeedProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  const getActivityIcon = (action: string, entityType: string = "") => {
    if (entityType === "transaction") {
      return <Receipt className="h-4 w-4" />;
    } else if (entityType === "budget") {
      return <Calendar className="h-4 w-4" />;
    } else if (entityType === "member") {
      if (action === "added_member") {
        return <UserPlus className="h-4 w-4" />;
      } else if (action === "removed_member") {
        return <UserMinus className="h-4 w-4" />;
      } else {
        return <Edit className="h-4 w-4" />;
      }
    } else if (entityType === "group") {
      return <Settings className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  const getActivityMessage = (item: GroupActivity) => {
    const { action, entity_type = "", details = {} } = item;

    // Format user name
    const userName =
      item.user?.user_profiles?.full_name || item.user?.id || "Unknown user";

    // Format action based on entity type and action
    if (entity_type === "transaction") {
      if (action === "created") {
        return t("groups.activityTransactionCreated", {
          user: userName,
          amount: details?.amount,
          type: details?.type,
        });
      } else if (action === "updated") {
        return t("groups.activityTransactionUpdated", {
          user: userName,
          amount: details?.amount,
          type: details?.type,
        });
      } else if (action === "deleted") {
        return t("groups.activityTransactionDeleted", {
          user: userName,
          amount: details?.amount,
          type: details?.type,
        });
      }
    } else if (entity_type === "budget") {
      if (action === "created") {
        return t("groups.activityBudgetCreated", {
          user: userName,
          name: details?.name,
          amount: details?.amount,
        });
      } else if (action === "updated") {
        return t("groups.activityBudgetUpdated", {
          user: userName,
          name: details?.name,
          amount: details?.amount,
        });
      } else if (action === "deleted") {
        return t("groups.activityBudgetDeleted", {
          user: userName,
          name: details?.name,
        });
      }
    } else if (entity_type === "member") {
      if (action === "added_member") {
        return t("groups.activityMemberAdded", {
          user: userName,
          member: details?.user_id,
          role: details?.role,
        });
      } else if (action === "updated_member") {
        return t("groups.activityMemberUpdated", {
          user: userName,
          member: details?.user_id,
          role: details?.role,
        });
      } else if (action === "removed_member") {
        return t("groups.activityMemberRemoved", {
          user: userName,
          member: details?.user_id,
        });
      }
    }

    // Default message
    return t("groups.activityGeneric", {
      user: userName,
      action,
      type: entity_type,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("groups.activityFeed")}</CardTitle>
        <CardDescription>{t("groups.activityFeedDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {!activity || activity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("groups.noActivity") || "No activity recorded yet"}
            </p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex">
                <div className="mr-4 flex flex-col items-center">
                  <Avatar className="h-9 w-9">
                    {item.user?.user_profiles?.avatar_url && (
                      <AvatarImage
                        src={item.user.user_profiles.avatar_url}
                        alt={
                          item.user?.user_profiles?.full_name ||
                          item.user?.id ||
                          ""
                        }
                      />
                    )}
                    <AvatarFallback>
                      {(
                        item.user?.user_profiles?.full_name ||
                        item.user?.id ||
                        ""
                      )
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="h-full w-px bg-border mt-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-muted p-1">
                      {getActivityIcon(item.action, item.entity_type)}
                    </div>
                    <p className="text-sm font-medium">
                      {getActivityMessage(item)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
