import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const { email, name } = await req.json()

    // Validate email
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Sending confirmation email to: ${email}`)

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: 'no-reply@ufsbd34.fr',
      to: email,
      subject: 'Welcome! Confirm Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome${name ? ` ${name}` : ''}!</h2>
          <p>Thank you for signing up for our dental health platform.</p>
          <p>Your account has been created successfully. You can now access all our features:</p>
          <ul>
            <li>Book appointments with top dentists</li>
            <li>Track your dental health progress</li>
            <li>Access personalized recommendations</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p style="color: #6b7280; font-size: 14px;">
            Best regards,<br>
            The Dental Health Team
          </p>
        </div>
      `,
    })

    console.log('Email sent successfully:', emailResponse)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent successfully',
        emailId: emailResponse.data?.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send confirmation email',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
