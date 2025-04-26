import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const url = new URL(req.url);
  const token = url.pathname.split("/").pop();
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // @ts-expect-error Deno global
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_ANON_KEY"));

  // Find the invitation by token
  const { data: invitation, error } = await supabase
    .from("group_invitations")
    .select("id, group_id, email, status, invited_by, role")
    .eq("token", token)
    .single();

  if (error || !invitation || invitation.status !== "pending") {
    return new Response(JSON.stringify({ error: "Invitation not found or already accepted/expired." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Update invitation status to accepted
  const { error: updateError } = await supabase
    .from("group_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  if (updateError) {
    return new Response(JSON.stringify({ error: "Failed to update invitation status." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Add the user to the group_members table as 'active' if not already present
  const { data: existingMember } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", invitation.group_id)
    .eq("user_id", invitation.invited_by)
    .single();

  if (!existingMember) {
    await supabase.from("group_members").insert({
      group_id: invitation.group_id,
      user_id: invitation.invited_by, // The inviter becomes a member
      role: invitation.role || 'member',
      joined_at: new Date().toISOString()
    });
  }

  // Log the activity in group_activity table
  await supabase.from("group_activity").insert({
    group_id: invitation.group_id,
    description: `User ${invitation.email} accepted the invitation and joined the group`,
    created_at: new Date().toISOString()
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
