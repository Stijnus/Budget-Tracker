import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface Invitation {
  id: string;
  group_id: string;
  group_name: string;
  email: string;
  status: "pending" | "accepted" | "expired";
}

export function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with your actual API endpoint for fetching invitation details
        const res = await fetch(`https://tkjmzixriehtmjhllfhg.supabase.co/functions/v1/get-invitation/${token}`);
        if (!res.ok) throw new Error("Invitation not found or expired.");
        const data = await res.json();
        setInvitation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err) || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!invitation) return;
    setAccepting(true);
    setError(null);
    try {
      // TODO: Replace with your actual API endpoint for accepting invitations
      const res = await fetch(`https://tkjmzixriehtmjhllfhg.supabase.co/functions/v1/accept-invitation/${token}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept invitation.");
      setAccepted(true);
      // Optionally redirect to the group dashboard
      setTimeout(() => {
        navigate(`/groups/${invitation.group_id}`);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || "Unknown error");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="text-destructive h-8 w-8 mb-2" />
        <div className="text-destructive font-medium">{error}</div>
        <Button className="mt-6" onClick={() => window.location.href = '/'}>Back to Home</Button>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="max-w-lg w-full shadow-lg border-2 border-blue-100">
        <CardHeader>
          <CardTitle>You're Invited to Join a Group!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 text-sm text-muted-foreground">
            Accept this invitation to join <span className="font-semibold text-blue-700">{invitation.group_name}</span> as <span className="font-semibold text-blue-700">{invitation.email}</span>.
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-semibold">Status:</span>
            <span className={
              invitation.status === "pending"
                ? "text-yellow-600"
                : invitation.status === "accepted"
                ? "text-green-600"
                : "text-gray-400 line-through"
            }>
              {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
            </span>
          </div>
          {accepted && (
            <div className="mt-4 p-3 rounded bg-green-50 text-green-800 border border-green-200">
              Invitation accepted! Redirecting to your group…
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {invitation.status === "pending" && !accepted && (
            <>
              <Button onClick={handleAccept} disabled={accepting}>
                {accepting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                Accept Invitation
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Decline
              </Button>
            </>
          )}
          {accepted && (
            <span className="text-green-700 font-medium">Accepted! Redirecting…</span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default InvitationPage;
