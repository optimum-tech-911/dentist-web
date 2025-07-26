import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.1";

serve(async (req) => {
  const { email } = await req.json();
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  try {
    await resend.emails.send({
      from: "noreply@ufsbd34.fr",
      to: email,
      subject: "Welcome to UFSBD!",
      html: "<p>Thanks for signing up! Please confirm your email.</p>",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
