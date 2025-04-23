import { useState } from "react";
import { updatePassword } from "../../../api/supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNotifications } from "../../../contexts/NotificationContext";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (newPassword !== confirmPassword) {
      addNotification(
        "Password Mismatch",
        "New passwords do not match. Please make sure both fields contain the same password.",
        "error"
      );
      return;
    }

    if (newPassword.length < 8) {
      addNotification(
        "Invalid Password",
        "Password must be at least 8 characters long.",
        "warning"
      );
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        addNotification("Password Update Failed", error.message, "error");
      } else {
        addNotification(
          "Password Updated",
          "Your password has been updated successfully.",
          "success"
        );
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      addNotification(
        "Error",
        "An unexpected error occurred while updating your password.",
        "error"
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="focus-visible:ring-1"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="focus-visible:ring-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="focus-visible:ring-1"
            />
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
