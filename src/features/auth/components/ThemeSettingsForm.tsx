import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { updateUserSettings } from "../../../api/supabase/auth";
import { useTheme } from "../../../providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Sun, Moon, Laptop } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Theme options
const THEMES = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Light mode with bright background and dark text",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Dark mode with dark background and light text",
  },
  {
    value: "system",
    label: "System",
    icon: Laptop,
    description: "Follow your system's theme settings",
  },
];

export function ThemeSettingsForm() {
  const { user, userSettings, refreshUserData } = useAuth();
  const { theme: currentTheme, setTheme: setAppTheme } = useTheme();
  const [theme, setTheme] = useState<"light" | "dark" | "system">(
    (currentTheme as "light" | "dark" | "system") || "light"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Initialize form with user settings
  useEffect(() => {
    if (userSettings) {
      setTheme(userSettings.theme || "light");
    }
  }, [userSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await updateUserSettings(user.id, {
        theme,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({
          text: "Theme settings updated successfully",
          type: "success",
        });
        // Refresh user data to update the UI
        if (refreshUserData) {
          await refreshUserData();
        }

        // Apply the theme immediately
        setAppTheme(theme as "light" | "dark" | "system");
      }
    } catch (err) {
      setMessage({ text: "An unexpected error occurred", type: "error" });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>
          Customize the appearance of the application
        </CardDescription>
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
          <div className="space-y-3">
            <Label>Select Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) =>
                setTheme(value as "light" | "dark" | "system")
              }
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {THEMES.map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <div key={themeOption.value}>
                    <RadioGroupItem
                      value={themeOption.value}
                      id={`theme-${themeOption.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`theme-${themeOption.value}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <Icon className="mb-3 h-6 w-6" />
                      <p className="font-medium">{themeOption.label}</p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        {themeOption.description}
                      </p>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Theme Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
