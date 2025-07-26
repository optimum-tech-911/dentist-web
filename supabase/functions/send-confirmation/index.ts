import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { Resend } from 'npm:resend'

const resend = new Resend('re_PKY25c41_AZLTLYzknWWNygBm9eacocSt')

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
      from: 'UFSBD Hérault <ufsbd34@ufsbd.fr>',
      to: email,
      subject: 'Bienvenue chez UFSBD Hérault',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">UFSBD Hérault</h1>
            <p style="color: #6b7280; margin: 5px 0;">Union Française pour la Santé Bucco-Dentaire</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 30px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <h2 style="color: #1e293b; margin-top: 0;">Bienvenue ${name || 'chez UFSBD'} !</h2>
            
            <p style="color: #374151; line-height: 1.6;">
              Nous sommes ravis de vous accueillir dans la communauté UFSBD Hérault !
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              Votre compte a été créé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.
            </p>
            
            <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="color: #065f46; margin: 0; font-size: 14px;">
                <strong>🎉 Félicitations !</strong> Vous faites maintenant partie de notre communauté dédiée à la santé bucco-dentaire.
              </p>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              Merci de rejoindre notre communauté et de contribuer à la promotion de la santé bucco-dentaire.
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

    console.log('Welcome email sent successfully:', { email, emailId: data?.id })

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Welcome email sent successfully',
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
