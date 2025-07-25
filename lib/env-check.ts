/**
 * Utility to check if required environment variables are set
 */
export const checkEnvironmentVariables = () => {
  const requiredVars = {
    VITE_RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars);
    console.error('Please check your .env file and ensure all required variables are set.');
    return false;
  }

  console.log('✅ All required environment variables are set');
  return true;
};

/**
 * Get Resend API key with validation
 */
export const getResendApiKey = () => {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_RESEND_API_KEY is not set. Please add it to your .env file.');
  }
  if (!apiKey.startsWith('re_')) {
    throw new Error('Invalid Resend API key format. It should start with "re_"');
  }
  return apiKey;
}; 