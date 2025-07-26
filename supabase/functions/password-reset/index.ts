import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { Resend } from 'npm:resend'

const resend = new Resend('re_PKY25c41_AZLTLYzknWWNygBm9eacocSt')

serve(async (req) => {
  try {
    const { email, resetLink } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!resetLink) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Reset link is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data, error } = await resend.emails.send({
      from: 'UFSBD Hérault <ufsbd34@ufsbd.fr>',
      to: email,
      subject: 'Réinitialisation de mot de passe - UFSBD Hérault',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">UFSBD Hérault</h1>
            <p style="color: #6b7280; margin: 5px 0;">Union Française pour la Santé Bucco-Dentaire</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h2 style="color: #1e293b; margin-top: 0;">Réinitialisation de mot de passe</h2>
            
            <p style="color: #374151; line-height: 1.6;">Bonjour,</p>
            
            <p style="color: #374151; line-height: 1.6;">
              Vous avez demandé la réinitialisation de votre mot de passe pour votre compte UFSBD Hérault.
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                Réinitialiser le mot de passe
              </a>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Important :</strong> Ce lien expirera dans 1 heure pour des raisons de sécurité.
              </p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
              Cet email a été envoyé par UFSBD Hérault<br>
              <strong>Contact :</strong> ufsbd34@ufsbd.fr<br>
              <strong>Site web :</strong> <a href="https://ufsbd34.fr" style="color: #2563eb;">ufsbd34.fr</a>
            </p>
          </div>
        </div>
      `,
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

    console.log('Password reset email sent successfully:', { email, emailId: data?.id })

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Password reset email sent successfully',
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