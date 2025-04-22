import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { updateUserProfile } from "../../../api/supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function ProfileForm() {
  const { user, userProfile, refreshUserData } = useAuth();
  // Use default values if userProfile is undefined
  const profile = userProfile || {};
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

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
    setMessage(null);

    try {
      const { error } = await updateUserProfile(user.id, {
        full_name: fullName,
        avatar_url: avatarUrl,
      });

      if (error) {
        setMessage({ text: error.message, type: "error" });
      } else {
        setMessage({ text: "Profile updated successfully", type: "success" });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled />
            <p className="text-xs text-muted-foreground">
              To change your email, use the account settings
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to an image for your profile picture
            </p>
          </div>

          {avatarUrl && (
            <div className="flex justify-center py-2">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={avatarUrl}
                  alt="Avatar preview"
                  onError={(e) => {
                    // Handle image load error
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/150?text=Error";
                  }}
                />
                <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          )}

          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
