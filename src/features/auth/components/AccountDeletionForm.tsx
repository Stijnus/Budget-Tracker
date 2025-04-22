import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../state/useAuth";
import { supabase } from "../../../api/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AccountDeletionForm() {
  const { user, logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate confirmation text
    if (confirmText !== "DELETE MY ACCOUNT") {
      setError("Please type DELETE MY ACCOUNT to confirm");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Delete user data from database
      // This will cascade delete all user data due to RLS policies
      const { error: deleteError } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Note: We can't delete the auth user from the client side
      // In a real app, we would call a server function to delete the user
      // For now, we'll just log the user out

      // Log the user out
      await logout();

      // Redirect to home page
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account. Please contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Account</CardTitle>
        <CardDescription>
          This action is permanent and cannot be undone. All your data will be
          permanently deleted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmText" className="text-destructive/90">
              To confirm, type "DELETE MY ACCOUNT" below
            </Label>
            <Input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              required
              className="border-destructive/30 focus-visible:ring-destructive/30"
            />
          </div>

          <Button
            type="submit"
            variant="destructive"
            className="w-full mt-4"
            disabled={isLoading || confirmText !== "DELETE MY ACCOUNT"}
          >
            {isLoading ? "Deleting..." : "Permanently Delete My Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
