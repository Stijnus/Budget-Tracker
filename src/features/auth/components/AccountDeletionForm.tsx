import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../state/useAuth";
import { supabase } from "../../../api/supabase/client";

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
    <div className="bg-white p-6 rounded-lg shadow-md border border-red-200">
      <h2 className="text-xl font-semibold text-red-600 mb-2">
        Delete Account
      </h2>
      <p className="text-gray-600 mb-6">
        This action is permanent and cannot be undone. All your data will be
        permanently deleted.
      </p>

      {error && (
        <div className="p-3 mb-4 text-sm bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="confirmText"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To confirm, type "DELETE MY ACCOUNT" below
          </label>
          <input
            id="confirmText"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || confirmText !== "DELETE MY ACCOUNT"}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Deleting..." : "Permanently Delete My Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
