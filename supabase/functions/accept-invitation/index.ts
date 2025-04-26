import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers to allow requests from specific origins
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // For development, we allow all origins
  // In production, you might want to restrict this to specific domains:
  // 'Access-Control-Allow-Origin': 'https://homeconomy.netlify.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Helper function to set the correct CORS origin based on the request
function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigins = ['http://localhost:5173', 'https://homeconomy.netlify.app'];
  
  // If the origin is in our allowed list, set it specifically
  // This is more secure than using a wildcard
  if (allowedOrigins.includes(origin)) {
    return {
      ...corsHeaders,
      'Access-Control-Allow-Origin': origin
    };
  }
  
  // Otherwise, return the default headers
  return corsHeaders;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) })
  }
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    return new Response("Method Not Allowed", { 
      status: 405,
      headers: getCorsHeaders(req) 
    });
  }
  const url = new URL(req.url);
  const token = url.pathname.split("/").pop();
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 400,
      headers: { 
        ...getCorsHeaders(req),
        "Content-Type": "application/json" 
      },
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
      headers: { 
        ...getCorsHeaders(req),
        "Content-Type": "application/json" 
      },
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
      headers: { 
        ...getCorsHeaders(req),
        "Content-Type": "application/json" 
      },
    });
  }

  // Get the current user from the request authorization header
  const authHeader = req.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
  
  // Get the user ID from the JWT token
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Failed to get user information" }), {
      status: 401,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
  
  // Check if the user is already a member of this group
  const { data: existingMember } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", invitation.group_id)
    .eq("user_id", user.id)
    .maybeSingle();

  // Only add the user if they're not already a member
  if (!existingMember) {
    // Use RPC to bypass RLS policies
    const { error: insertError } = await supabase.rpc('add_group_member', {
      p_group_id: invitation.group_id,
      p_user_id: user.id,
      p_role: invitation.role || 'member'
    });
    
    if (insertError) {
      console.error('Error adding member via RPC:', insertError);
      
      // Fallback: Try direct insert with service role
      const { error: directError } = await supabase.from("group_members").insert({
        group_id: invitation.group_id,
        user_id: user.id,
        role: invitation.role || 'member',
        joined_at: new Date().toISOString()
      });
      
      if (directError) {
        return new Response(JSON.stringify({ error: "Failed to add you to the group: " + directError.message }), {
          status: 500,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      }
    }
  }

  // Log the activity in group_activity table
  await supabase.from("group_activity").insert({
    group_id: invitation.group_id,
    description: `User ${invitation.email} accepted the invitation and joined the group`,
    created_at: new Date().toISOString()
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 
      ...getCorsHeaders(req),
      "Content-Type": "application/json" 
    },
  });
});
