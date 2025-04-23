import { Bell } from "lucide-react";
import { useNotifications } from "../../../contexts/NotificationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./NotificationItem";
// Language provider import removed

export function NotificationCenter() {
  const { notifications, hasUnreadNotifications, markAllAsRead, clearAll } =
    useNotifications();
  // Language hooks removed

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground relative"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {hasUnreadNotifications && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[70vh]">
              <div className="flex items-center justify-between p-3">
                <h3 className="font-medium">Notifications</h3>
                <div className="flex gap-1.5">
                  {hasUnreadNotifications && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs text-muted-foreground"
                      onClick={markAllAsRead}
                    >
                      Mark All as Read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs text-muted-foreground"
                      onClick={clearAll}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />

              <div className="overflow-y-auto max-h-[50vh]">
                <DropdownMenuGroup>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))
                  ) : (
                    <DropdownMenuItem
                      className="text-center text-sm text-muted-foreground p-8 opacity-70"
                      disabled
                    >
                      No Notifications
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
