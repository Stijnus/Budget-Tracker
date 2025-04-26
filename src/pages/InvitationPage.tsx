import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "../api/supabase/client";

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
      if (!token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Use Supabase directly to avoid CORS issues
        const { data, error } = await supabase
          .from("group_invitations")
          .select(`
            id,
            group_id,
            email,
            status,
            budget_groups(name)
          `)
          .eq("token", token)
          .single();
        
        if (error) throw new Error("Invitation not found or expired.");
        if (!data) throw new Error("Invitation not found.");
        
        // Format the data to match our Invitation interface
        setInvitation({
          id: data.id,
          group_id: data.group_id,
          group_name: data.budget_groups?.name || "Budget Group",
          email: data.email,
          status: (data.status === 'rejected' ? 'expired' : data.status) as 'pending' | 'accepted' | 'expired'
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err) || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    
    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!invitation) return;
    setAccepting(true);
    setError(null);
    
    try {
      // Use the Edge Function to accept the invitation
      // This function handles all the necessary database operations with proper permissions
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`https://tkjmzixriehtmjhllfhg.supabase.co/functions/v1/accept-invitation/${token}`, { 
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY ?? "",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY ?? ""}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to accept invitation");
      }
      
      setAccepted(true);
      // Redirect to the group dashboard
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
