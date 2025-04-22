import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { updateUserSettings } from "../../../api/supabase/auth";
import { useLanguage, LANGUAGES } from "../../../providers/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Convert the LANGUAGES object to an array for easier use in the component
const LANGUAGE_OPTIONS = Object.entries(LANGUAGES).map(([code, details]) => ({
  code,
  name: code.toUpperCase(),
  flag: details.flag,
  native: details.nativeName,
}));

export function LanguageSettingsForm() {
  const { user, userSettings, refreshUserData } = useAuth();
  const { language: currentLanguage, changeLanguage } = useLanguage();
  const [language, setLanguage] = useState(currentLanguage || "en");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Initialize form with user settings
  useEffect(() => {
    if (userSettings) {
      setLanguage(userSettings.language || "en");
    }
  }, [userSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await updateUserSettings(user.id, {
        language,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({
          text: "Language settings updated successfully",
          type: "success",
        });
        // Refresh user data to update the UI
        if (refreshUserData) {
          await refreshUserData();
        }

        // Apply the language immediately
        await changeLanguage(language);
      }
    } catch (err) {
      setMessage({ text: "An unexpected error occurred", type: "error" });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedLanguage =
    LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Settings</CardTitle>
        <CardDescription>
          Choose your preferred language for the application
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
          <div className="space-y-2">
            <Label htmlFor="language">Select Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center">
                      <span className="mr-2">{lang.flag}</span>
                      <span>{lang.name}</span>
                      <span className="ml-2 text-muted-foreground">
                        ({lang.native})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will change the language used throughout the application
            </p>
          </div>

          <div className="border rounded-md p-4 bg-muted/50">
            <h3 className="text-sm font-medium mb-2">Language Preview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Flag:</span>
                <span className="text-sm font-medium">
                  {selectedLanguage.flag}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">
                  {selectedLanguage.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Native:</span>
                <span className="text-sm font-medium">
                  {selectedLanguage.native}
                </span>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Language Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
