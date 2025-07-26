import { EmailFallbackService } from './email-fallback';
import { SimpleEmailService } from './simple-email';

// Try to import Resend, but don't break if it fails
let Resend: any = null;
let resend: any = null;

try {
  const resendModule = require('resend');
  Resend = resendModule.Resend;
} catch (error) {
  console.warn('Resend package not available, using fallback email service');
}

const getResendClient = () => {
  try {
    if (!Resend) {
      return null;
    }
    
    if (!resend) {
      const apiKey = import.meta.env.VITE_RESEND_API_KEY;
      if (!apiKey) {
        console.warn('Resend API key not configured - using fallback service');
        return null;
      }
      resend = new Resend(apiKey);
    }
    return resend;
  } catch (error) {
    console.error('Failed to initialize Resend client:', error);
    return null;
  }
};

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  /**
   * Send an email using Resend or fallback
   */
  static async sendEmail(data: EmailData) {
    try {
      const resendClient = getResendClient();
      
      if (!resendClient) {
        // Use simple email service when Resend is not configured
        console.warn('Resend not configured, using simple email service');
        return SimpleEmailService.sendEmail(data);
      }
      
      const result = await resendClient.emails.send({
        from: data.from || 'UFSBD Hérault <ufsbd34@ufsbd.fr>',
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      console.log('📧 Email sent successfully via Resend:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      console.log('📧 Falling back to simple email service...');
      // Always fallback to ensure email functionality works
      return SimpleEmailService.sendEmail(data);
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, resetLink: string) {
    const resendClient = getResendClient();
    
    if (!resendClient) {
      return SimpleEmailService.sendPasswordResetEmail(email, resetLink);
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
    `;

    return this.sendEmail({
      to: email,
      subject: 'Réinitialisation de mot de passe - UFSBD Hérault',
      html,
    });
  }

  /**
   * Send welcome email for new users
   */
  static async sendWelcomeEmail(email: string, name?: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bienvenue chez UFSBD Hérault</h2>
        <p>Bonjour${name ? ` ${name}` : ''},</p>
        <p>Merci de vous être inscrit sur notre plateforme UFSBD Hérault.</p>
        <p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à toutes nos fonctionnalités.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${window.location.origin}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accéder au site
          </a>
        </div>
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          UFSBD Hérault<br>
          Contact: ufsbd34@ufsbd.fr
        </p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Bienvenue chez UFSBD Hérault',
      html,
    });
  }

  /**
   * Send contact form notification
   */
  static async sendContactNotification(formData: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) {
    const resendClient = getResendClient();
    
    if (!resendClient) {
      return SimpleEmailService.sendEmail({
        to: 'ufsbd34@ufsbd.fr',
        subject: `Nouveau message de ${formData.name} - UFSBD Hérault`,
        html: `
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
        `,
      });
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nouveau message de contact</h2>
        <p>Un nouveau message a été reçu via le formulaire de contact :</p>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nom :</strong> ${formData.name}</p>
          <p><strong>Email :</strong> ${formData.email}</p>
          <p><strong>Téléphone :</strong> ${formData.phone}</p>
          <p><strong>Message :</strong></p>
          <p style="white-space: pre-wrap;">${formData.message}</p>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          UFSBD Hérault - Système de notification
        </p>
      </div>
    `;

    return this.sendEmail({
      to: 'ufsbd34@ufsbd.fr',
      subject: 'Nouveau message de contact - UFSBD Hérault',
      html,
    });
  }
} 