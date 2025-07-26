import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  const { email } = await req.json()

  try {
    await resend.emails.send({
      from: 'no-reply@ufsbd34.fr',  // use your verified Resend domain
      to: email,
      subject: 'Confirm your Signup',
      html: `<p>Welcome to our platform!</p>`,
    })

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
