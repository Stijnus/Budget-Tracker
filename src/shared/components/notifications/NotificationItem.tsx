import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  Notification,
  NotificationType,
  useNotifications,
} from "../../../contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onSelect?: () => void;
}

export function NotificationItem({
  notification,
  onSelect,
}: NotificationItemProps) {
  const { markAsRead, removeNotification } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);

  const getIconByType = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundByType = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20";
      case "error":
        return "bg-red-50 dark:bg-red-900/20";
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/20";
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-900/20";
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (onSelect) {
      onSelect();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };

  return (
    <DropdownMenuItem
      className={cn(
        "px-4 py-3 flex items-start gap-3 cursor-pointer relative",
        !notification.read && getBackgroundByType(notification.type),
        !notification.read && "font-medium"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIconByType(notification.type)}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-xs text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
      {isHovered && (
        <button
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/80"
          onClick={handleRemove}
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </DropdownMenuItem>
  );
}
