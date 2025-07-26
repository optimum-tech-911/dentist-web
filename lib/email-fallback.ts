/**
 * Fallback email service when Resend is not configured
 */
export class EmailFallbackService {
  /**
   * Send a fallback email (logs to console in development)
   */
  static async sendEmail(data: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }) {
    if (import.meta.env.DEV) {
      console.log('📧 Email Fallback (Development Mode):');
      console.log('From:', data.from || 'UFSBD Hérault <ufsbd34@ufsbd.fr>');
      console.log('To:', data.to);
      console.log('Subject:', data.subject);
      console.log('Content:', data.html);
      console.log('---');
      
      return { 
        success: true, 
        data: { 
          id: 'fallback-' + Date.now(),
          message: 'Email logged to console (development mode)'
        } 
      };
    } else {
      // In production, return error
      return { 
        success: false, 
        error: new Error('Email service is not configured. Please set up Resend API key.') 
      };
    }
  }

  /**
   * Send password reset email fallback
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

  /**
   * Send contact notification fallback
   */
  static async sendContactNotification(formData: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Téléphone:</strong> ${formData.phone}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
          ${formData.message}
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          UFSBD Hérault<br>
          Contact: ufsbd34@ufsbd.fr
        </p>
      </div>
    `;

    return this.sendEmail({
      to: 'ufsbd34@ufsbd.fr',
      subject: `Nouveau message de ${formData.name} - UFSBD Hérault`,
      html,
    });
  }
} 