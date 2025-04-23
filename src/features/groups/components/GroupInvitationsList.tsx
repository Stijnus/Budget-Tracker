import { useState } from "react";
// Translation imports removed
import { useAuth } from "../../../state/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  acceptInvitation,
  rejectInvitation,
} from "../../../api/supabase/budgetGroups";
import { Check, X, Clock } from "lucide-react";

interface Invitation {
  id: string;
  group_id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  token: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  invited_by: string;
  expires_at: string;
  created_at: string;
  updated_at?: string;
  group?: {
    id: string;
    name: string;
    description: string | null;
    avatar_url: string | null;
  };
  inviter?: {
    id: string;
    user_profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

interface GroupInvitationsListProps {
  invitations: Invitation[];
  onAccept: () => void;
}

export function GroupInvitationsList({
  invitations,
  onAccept,
}: GroupInvitationsListProps) {
  // Translation hooks removed
  const { user } = useAuth();
  const [processingInvitations, setProcessingInvitations] = useState<
    Record<string, boolean>
  >({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAccept = async (token: string) => {
    if (!user) return;

    setProcessingInvitations((prev) => ({ ...prev, [token]: true }));
    setErrors((prev) => ({ ...prev, [token]: "" }));

    try {
      const { error } = await acceptInvitation(token, user.id);

      if (error) throw error;

      onAccept();
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setErrors((prev) => ({
        ...prev,
        [token]: "Failed to accept invitation. Please try again.",
      }));
    } finally {
      setProcessingInvitations((prev) => ({ ...prev, [token]: false }));
    }
  };

  const handleReject = async (token: string) => {
    setProcessingInvitations((prev) => ({ ...prev, [token]: true }));
    setErrors((prev) => ({ ...prev, [token]: "" }));

    try {
      const { error } = await rejectInvitation(token);

      if (error) throw error;

      onAccept(); // Refresh the list
    } catch (err) {
      console.error("Error rejecting invitation:", err);
      setErrors((prev) => ({
        ...prev,
        [token]: "Failed to reject invitation. Please try again.",
      }));
    } finally {
      setProcessingInvitations((prev) => ({ ...prev, [token]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card
          key={invitation.id}
          className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar className="border-2 border-purple-100">
                  {invitation.group?.avatar_url && (
                    <AvatarImage
                      src={invitation.group.avatar_url}
                      alt={invitation.group?.name || ""}
                    />
                  )}
                  <AvatarFallback className="bg-purple-50 text-purple-700">
                    {invitation.group?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {invitation.group?.name}
                  </CardTitle>
                  <CardDescription>
                    {"InvitedBy"}:{" "}
                    {invitation.inviter?.user_profiles?.full_name ||
                      invitation.inviter?.id}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
                {invitation.role === "admin"
                  ? "RoleAdmin"
                  : invitation.role === "member"
                  ? "RoleMember"
                  : "RoleViewer"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm">
              {invitation.group?.description || "NoDescription"}
            </p>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4 text-purple-500" />
              <span>
                {"ExpiresOn"}: {formatDate(invitation.expires_at)}
              </span>
            </div>
            {errors[invitation.token] && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{errors[invitation.token]}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReject(invitation.token)}
              disabled={processingInvitations[invitation.token]}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <X className="mr-1 h-4 w-4" />
              {"Decline"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleAccept(invitation.token)}
              disabled={processingInvitations[invitation.token]}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Check className="mr-1 h-4 w-4" />
              {"Accept"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
