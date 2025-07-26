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

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte UFSBD.</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Réinitialiser le mot de passe
          </a>
        </div>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Cet email a été envoyé par UFSBD Hérault.<br>
          Contact: ufsbd34@ufsbd.fr
        </p>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'UFSBD Hérault <ufsbd34@ufsbd.fr>',
      to: email,
      subject: 'Réinitialisation de mot de passe - UFSBD Hérault',
      html: html,
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