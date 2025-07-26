import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const { email, name } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data, error } = await resend.emails.send({
      from: 'UFSBD <no-reply@ufsbd34.fr>',
      to: email,
      subject: 'Welcome to UFSBD',
      html: `<p>Hello ${name || 'there'},</p><p>Welcome to UFSBD! Your account has been created successfully.</p><p>Thank you for joining our community.</p>`,
    })

    if (error) {
      console.error('Resend error:', error)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to send email',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Server error',
      details: err.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
