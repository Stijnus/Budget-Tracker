// Translation imports removed
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

export function GroupActivityFeed(props: GroupActivityFeedProps) {
  const { activity } = props;
  // groupId is not used but kept for API consistency
  // Translation hooks removed

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
        return `${userName} created a new ${
          details?.type || "transaction"
        } for $${details?.amount || 0}`;
      } else if (action === "updated") {
        return `${userName} updated a ${details?.type || "transaction"} for $${
          details?.amount || 0
        }`;
      } else if (action === "deleted") {
        return `${userName} deleted a ${details?.type || "transaction"} for $${
          details?.amount || 0
        }`;
      }
    } else if (entity_type === "budget") {
      if (action === "created") {
        return `${userName} created a new budget "${
          details?.name || ""
        }" for $${details?.amount || 0}`;
      } else if (action === "updated") {
        return `${userName} updated budget "${details?.name || ""}" to $${
          details?.amount || 0
        }`;
      } else if (action === "deleted") {
        return `${userName} deleted budget "${details?.name || ""}"`;
      }
    } else if (entity_type === "member") {
      if (action === "added_member") {
        return `${userName} added a new member with role ${
          details?.role || "member"
        }`;
      } else if (action === "updated_member") {
        return `${userName} updated a member's role to ${
          details?.role || "member"
        }`;
      } else if (action === "removed_member") {
        return `${userName} removed a member from the group`;
      }
    }

    // Default message
    return `${userName} performed action "${action}" on ${
      entity_type || "item"
    }`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent activity in this group</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {!activity || activity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No activity recorded yet
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
