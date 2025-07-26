// Simple email test for Resend
import { supabase } from '@/integrations/supabase/client';

export const testResendEmail = async (email: string) => {
  try {
    console.log('🧪 Testing Resend email with:', email);
    
    // Test password reset (this will send an email)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });
    
    if (error) {
      console.error('❌ Resend test failed:', error);
      return {
        success: false,
        error: error.message,
        details: 'Password reset email failed to send'
      };
    }
    
    console.log('✅ Resend test successful - email should be sent');
    return {
      success: true,
      error: null,
      details: 'Password reset email sent successfully'
    };
    
  } catch (error: any) {
    console.error('❌ Resend test error:', error);
    return {
      success: false,
      error: error.message,
      details: 'Unexpected error during email test'
    };
  }
};

export const checkSupabaseConnection = async () => {
  try {
    console.log('🔍 Checking Supabase connection...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return {
        connected: false,
        error: error.message
      };
    }
    
    console.log('✅ Supabase connection successful');
    return {
      connected: true,
      error: null
    };
    
  } catch (error: any) {
    console.error('❌ Connection check error:', error);
    return {
      connected: false,
      error: error.message
    };
  }
}; 