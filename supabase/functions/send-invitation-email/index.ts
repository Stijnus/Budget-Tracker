// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Deno global variables are available at runtime in Supabase Edge Functions.
// Ignore TypeScript errors locally for Deno.env usage.

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
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

    // Send the real email using Brevo (Sendinblue)
    // Requires: BREVO_API_KEY in .env
    //           BREVO_SENDER (your verified sender email) in .env (or hardcoded below)
    // @ts-expect-error: Deno global is available at runtime in Supabase Edge Functions
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    // @ts-expect-error: Deno global is available at runtime in Supabase Edge Functions
    const BREVO_SENDER =
      Deno.env.get("BREVO_SENDER") || "private.winters.bf3@gmail.com"; // <-- Replace with your verified sender!

    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY is not set");
      return new Response(JSON.stringify({ error: "BREVO_API_KEY not set" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("Sending invitation email via Brevo", {
      to: email,
      groupName,
      invitationLink,
      from: BREVO_SENDER,
      apiKeySet: !!BREVO_API_KEY,
    });

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Budget Tracker", email: BREVO_SENDER },
        to: [{ email }],
        subject: `You're invited to join ${groupName}!`,
        htmlContent: `
          <p>Hello,</p>
          <p>You've been invited to join the group <b>${groupName}</b> on Budget Tracker.</p>
          <p>Click <a href="${invitationLink}">here</a> to accept your invitation.</p>
          <p>If you did not expect this invitation, you can safely ignore this email.</p>
        `,
      }),
    });

    if (!brevoRes.ok) {
      const errorText = await brevoRes.text();
      console.error("Brevo API error:", errorText);
      return new Response(
        JSON.stringify({ error: `Failed to send email: ${errorText}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation email sent to ${email}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    // Enhanced error logging
    let errorInfo = {};
    if (error instanceof Error) {
      errorInfo = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else {
      errorInfo = { error: String(error) };
    }
    console.error("Unhandled error in send-invitation-email:", errorInfo);
    return new Response(JSON.stringify({ error: errorInfo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
