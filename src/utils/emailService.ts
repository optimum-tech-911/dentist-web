// Direct email service for Supabase Edge Function
export const sendWelcomeEmail = async (email: string) => {
  try {
    const response = await fetch(
      'https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      return { success: true, data: result };
    } else {
      return { success: false, error: result.error || 'Failed to send email' };
    }
  } catch (error) {
    console.error('Email service error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
};

// Usage example:
/*
import { sendWelcomeEmail } from '@/utils/emailService';

// After successful signup
const emailResult = await sendWelcomeEmail(userEmail);
if (emailResult.success) {
  console.log('✅ Welcome email sent!');
} else {
  console.error('❌ Email failed:', emailResult.error);
}
*/