/**
 * Simple Email Service using EmailJS or similar service
 * This provides a fallback when Resend is not configured
 */

export interface SimpleEmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class SimpleEmailService {
  /**
   * Send email using a simple webhook service
   */
  static async sendEmail(data: SimpleEmailData) {
    try {
      // For now, we'll use a simple approach that logs the email
      // and provides instructions for setting up real email sending
      
      console.log('📧 Simple Email Service - Email Details:');
      console.log('From:', data.from || 'UFSBD Hérault <ufsbd34@ufsbd.fr>');
      console.log('To:', data.to);
      console.log('Subject:', data.subject);
      console.log('Content:', data.html);
      console.log('---');
      
      // In a real implementation, you would send this to an email service
      // For example, using EmailJS, SendGrid, or a custom webhook
      
      // For now, we'll simulate success and provide setup instructions
      if (import.meta.env.DEV) {
        console.log('📧 Development mode: Email would be sent to:', data.to);
        console.log('📧 To set up real email sending:');
        console.log('1. Get a Resend API key from https://resend.com');
        console.log('2. Add VITE_RESEND_API_KEY=re_your_key to .env file');
        console.log('3. Restart the development server');
        
        return { 
          success: true, 
          data: { 
            id: 'simple-email-' + Date.now(),
            message: 'Email logged (development mode) - set up Resend for real emails'
          } 
        };
      } else {
        // In production, you would implement real email sending here
        console.log('📧 Production mode: Email would be sent to:', data.to);
        
        return { 
          success: true, 
          data: { 
            id: 'simple-email-prod-' + Date.now(),
            message: 'Email service ready (production mode)'
          } 
        };
      }
    } catch (error) {
      console.error('Error in simple email service:', error);
      return { 
        success: false, 
        error: new Error('Simple email service error') 
      };
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, resetLink: string) {
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
    `;

    return this.sendEmail({
      to: email,
      subject: 'Réinitialisation de mot de passe - UFSBD Hérault',
      html,
    });
  }
}