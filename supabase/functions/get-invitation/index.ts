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

  // Query the invitations table by token
  const { data, error } = await supabase
    .from("group_invitations")
    .select("id, group_id, email, token, status, invited_by, expires_at, created_at, metadata")
    .eq("token", token)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Invitation not found or expired." }), {
      status: 404,
      headers: { 
        ...getCorsHeaders(req),
        "Content-Type": "application/json" 
      },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 
      ...getCorsHeaders(req),
      "Content-Type": "application/json" 
    },
  });
});
