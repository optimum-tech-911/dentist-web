// supabase/functions/send-confirmation/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Resend } from 'npm:resend'

serve(async (req) => {
  const { email } = await req.json()
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome to My Dentist Website",
      html: "<strong>Thanks for signing up!</strong>",
    })

    return new Response(JSON.stringify(data))
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
})
