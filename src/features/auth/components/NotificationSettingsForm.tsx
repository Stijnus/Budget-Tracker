import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { updateUserSettings } from "../../../api/supabase/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Notification types
const NOTIFICATION_TYPES = [
  {
    id: "bill_due",
    name: "Bill Due Reminders",
    description: "Get notified when bills are due",
  },
  {
    id: "budget_alert",
    name: "Budget Alerts",
    description: "Get notified when you're close to exceeding your budget",
  },
  {
    id: "goal_progress",
    name: "Goal Progress",
    description: "Get notified about your savings goal progress",
  },
  {
    id: "transaction_alert",
    name: "Transaction Alerts",
    description: "Get notified about new transactions",
  },
  {
    id: "weekly_summary",
    name: "Weekly Summary",
    description: "Get a weekly summary of your finances",
  },
];

export function NotificationSettingsForm() {
  const { user, userSettings, refreshUserData } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationPreferences, setNotificationPreferences] = useState<
    Record<string, boolean>
  >({
    bill_due: true,
    budget_alert: true,
    goal_progress: true,
    transaction_alert: false,
    weekly_summary: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Initialize form with user settings
  useEffect(() => {
    if (userSettings) {
      setNotificationsEnabled(userSettings.notification_enabled);

      // In a real app, we would load notification preferences from the database
      // For now, we'll just use the default values
    }
  }, [userSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await updateUserSettings(user.id, {
        notification_enabled: notificationsEnabled,
        // In a real app, we would save notification preferences to the database
        // notification_preferences: notificationPreferences,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({
          text: "Notification settings updated successfully",
          type: "success",
        });
        // Refresh user data to update the UI
        if (refreshUserData) {
          await refreshUserData();
        }
      }
    } catch (err) {
      setMessage({ text: "An unexpected error occurred", type: "error" });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotificationType = (id: string) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert
            variant={message.type === "success" ? "default" : "destructive"}
            className="mb-4"
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications-master"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <Label
              htmlFor="notifications-master"
              className="cursor-pointer font-medium"
            >
              Enable all notifications
            </Label>
          </div>

          {notificationsEnabled && (
            <div className="space-y-4 mt-4 border-t pt-4">
              <h3 className="text-sm font-medium">Notification Types</h3>

              <div className="space-y-4">
                {NOTIFICATION_TYPES.map((type) => (
                  <div key={type.id} className="flex items-start space-x-3">
                    <Switch
                      id={`notification-${type.id}`}
                      checked={notificationPreferences[type.id]}
                      onCheckedChange={() => toggleNotificationType(type.id)}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor={`notification-${type.id}`}
                        className="cursor-pointer font-medium"
                      >
                        {type.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Notification Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
