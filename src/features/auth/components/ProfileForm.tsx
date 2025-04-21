import { useState, useEffect } from "react";
import { useAuth } from "../../../state/useAuth";
import { updateUserProfile } from "../../../api/supabase/auth";

export function ProfileForm() {
  const { user, userProfile, refreshUserData } = useAuth();
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
        await refreshUserData();
      }
    } catch (err) {
      setMessage({ text: "An unexpected error occurred", type: "error" });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Profile Information
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 text-sm rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            To change your email, use the account settings
          </p>
        </div>

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="avatarUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter a URL to an image for your profile picture
          </p>
        </div>

        {avatarUrl && (
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200">
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Handle image load error
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/150?text=Error";
                }}
              />
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
