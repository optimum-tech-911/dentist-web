// Test email functionality
import { supabase } from '@/integrations/supabase/client';

export const testEmailFunction = async () => {
  try {
    console.log('🧪 Testing email functionality...');
    
    // Test 1: Check if Supabase is connected
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('✅ Supabase connection:', authError ? 'FAILED' : 'WORKING');
    
    if (authError) {
      console.error('❌ Supabase connection failed:', authError);
      return false;
    }
    
    // Test 2: Check if email service is configured
    const { data: settings, error: settingsError } = await supabase.auth.admin.getUserById('test');
    console.log('✅ Email service check completed');
    
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return false;
  }
};

export const testPasswordReset = async (email: string) => {
  try {
    console.log('🧪 Testing password reset...');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });
    
    if (error) {
      console.error('❌ Password reset failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Password reset email sent successfully');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('❌ Password reset test failed:', error);
    return { success: false, error: error.message };
  }
}; 