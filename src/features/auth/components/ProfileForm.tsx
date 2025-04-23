import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { updateUserProfile } from "../../../api/supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Info, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotifications } from "../../../contexts/NotificationContext";

export function ProfileForm() {
  const { user, userProfile, refreshUserData } = useAuth();
  const { addNotification } = useNotifications();

  // Use default values if userProfile is undefined
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
      setAvatarUrl(userProfile.avatar_url || "");
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await updateUserProfile(user.id, {
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      if (error) {
        addNotification("Profile Update Failed", error.message, "error");
      } else {
        addNotification(
          "Profile Updated",
          "Your profile information has been updated successfully.",
          "success"
        );

        // Refresh user data to update the UI
        if (refreshUserData) {
          await refreshUserData();
        }
      }
    } catch (err) {
      addNotification(
        "Error",
        "An unexpected error occurred while updating your profile.",
        "error"
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-t-4 border-t-violet-500 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <User className="mr-2 h-5 w-5 text-violet-500" />
          Profile Information
        </CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="pr-10 bg-muted/50"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute inset-y-0 right-3 flex items-center">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Email cannot be changed here</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              To change your email, use the account settings
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="focus-visible:ring-1"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl" className="text-sm font-medium">
              Avatar URL
            </Label>
            <Input
              id="avatarUrl"
              type="text"
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setPreviewError(false); // Reset error state when URL changes
              }}
              placeholder="https://example.com/avatar.jpg"
              className="focus-visible:ring-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a URL to an image for your profile picture
            </p>
          </div>

          {avatarUrl && (
            <div className="flex flex-col items-center py-2 space-y-2">
              <div className="relative">
                <Avatar className="w-20 h-20 border">
                  <AvatarImage
                    src={avatarUrl}
                    alt="Avatar preview"
                    onError={(e) => {
                      // Handle image load error
                      setPreviewError(true);
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <AvatarFallback
                    className={`text-lg ${
                      previewError ? "bg-red-50 text-red-500" : ""
                    }`}
                  >
                    {previewError
                      ? "Error"
                      : fullName.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                {previewError && (
                  <div className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1">
                    <X className="h-4 w-4" />
                  </div>
                )}
              </div>
              {previewError && (
                <p className="text-xs text-red-500">
                  Failed to load image. Please check the URL.
                </p>
              )}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-end pt-2">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full md:w-auto bg-violet-600 hover:bg-violet-700"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
