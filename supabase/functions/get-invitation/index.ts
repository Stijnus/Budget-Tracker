import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
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

  // Query the invitations table by token
  const { data, error } = await supabase
    .from("group_invitations")
    .select("id, group_id, email, token, status, invited_by, expires_at, created_at, metadata")
    .eq("token", token)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Invitation not found or expired." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
