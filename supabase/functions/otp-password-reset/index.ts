import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { Resend } from 'npm:resend'

const resend = new Resend('re_PKY25c41_AZLTLYzknWWNygBm9eacocSt')

serve(async (req) => {
  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cmcfeiskfdbsefzqywbk.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA5MDAzMiwiZXhwIjoyMDY3NjY2MDMyfQ.v1YFUEK7xRQrfzJVfWPo_q0CTqp5eAZhyPmw6CZKqpw'
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate OTP using the database function
    const { data: otpResult, error: otpError } = await supabase
      .rpc('generate_password_reset_otp', { user_email: email })

    if (otpError) {
      console.error('OTP generation error:', otpError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to generate OTP',
        details: otpError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if OTP generation was successful
    if (!otpResult.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: otpResult.message 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Send OTP via email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'UFSBD Hérault <onboarding@resend.dev>',
      to: email,
      subject: 'Code de vérification - Réinitialisation de mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">UFSBD Hérault</h1>
            <p style="color: #6b7280; margin: 5px 0;">Union Française pour la Santé Bucco-Dentaire</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h2 style="color: #1e293b; margin-top: 0;">Code de vérification OTP</h2>
            
            <p style="color: #374151; line-height: 1.6;">Bonjour,</p>
            
            <p style="color: #374151; line-height: 1.6;">
              Vous avez demandé la réinitialisation de votre mot de passe pour votre compte UFSBD Hérault.
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              Voici votre code de vérification à 6 chiffres :
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otpResult.otp_code}
              </div>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⚠️ Important :</strong> Ce code expire dans 10 minutes pour des raisons de sécurité.
                <br>Vous avez 3 tentatives maximum pour saisir le code correct.
              </p>
            </div>
            
            <div style="background-color: #dcfce7; border: 1px solid #16a34a; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #166534; margin: 0; font-size: 14px;">
                <strong>📱 Instructions :</strong>
                <br>1. Retournez sur la page de réinitialisation
                <br>2. Saisissez ce code à 6 chiffres
                <br>3. Créez votre nouveau mot de passe
              </p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
            </p>
          </div>
          
                      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
              Cet email a été envoyé par UFSBD Hérault<br>
              <strong>Contact :</strong> contact@ufsbd-herault.fr<br>
              <strong>Site web :</strong> <a href="https://your-website.com" style="color: #2563eb;">UFSBD Hérault</a>
            </p>
          </div>
        </div>
      `,
      text: `
UFSBD Hérault - Code de vérification

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe.

Votre code de vérification : ${otpResult.otp_code}

Ce code expire dans 10 minutes.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Contact: contact@ufsbd-herault.fr
Site: UFSBD Hérault
      `
    })

    if (emailError) {
      console.error('Email error:', emailError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to send email',
        details: emailError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('OTP email sent successfully:', { 
      email, 
      emailId: emailData?.id,
      otp_expires: otpResult.expires_at
    })

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Code OTP envoyé avec succès',
      emailId: emailData?.id,
      expires_at: otpResult.expires_at
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