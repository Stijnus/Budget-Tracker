// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// @ts-expect-error Deno Edge Function import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-expect-error Deno Edge Function import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    createClient(
      // Supabase API URL - env var exported by default.
      // @ts-expect-error Deno global
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API ANON KEY - env var exported by default.
      // @ts-expect-error Deno global
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the request body
    const { email, groupName, invitationLink } = await req.json();

    // Validate the request
    if (!email || !groupName || !invitationLink) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // For now, we'll just log the email details
    // In a real implementation, you would use a service like SendGrid or Mailgun
    console.log(`Sending invitation email to ${email} for group ${groupName}`);
    console.log(`Invitation link: ${invitationLink}`);

    // Simulate sending an email
    // In a real implementation, you would call your email service API here
    
    // For demonstration purposes, we'll just return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitation email would be sent to ${email}` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
