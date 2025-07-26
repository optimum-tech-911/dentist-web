# 📧 Supabase Auth + Custom Email Integration

## Edge Function Created ✅

**Location:** `supabase/functions/send-confirmation/index.ts`

**Function URL:** `https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation`

## Integration with Signup

### Frontend Signup Code Example:

```javascript
// In your signup component
const handleSignup = async (email, password) => {
  try {
    // 1. Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Signup error:', error);
      return;
    }

    // 2. Call your custom email function
    const emailResponse = await fetch('https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const emailResult = await emailResponse.json();

    if (emailResult.success) {
      console.log('✅ Welcome email sent!');
      // Show success message to user
    } else {
      console.error('❌ Email failed:', emailResult.error);
    }

  } catch (error) {
    console.error('Signup process error:', error);
  }
};
```

### React Hook Example:

```javascript
import { useState } from 'react';
import { supabase } from './supabaseClient';

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Supabase signup
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) throw signupError;

      // Send welcome email
      await fetch('https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};
```

## Deployment Steps

1. **Deploy the function** (via Dashboard since CLI has ARM64 issues):
   - Go to Supabase Dashboard → Edge Functions
   - Create function named `send-confirmation`
   - Paste the code from `supabase/functions/send-confirmation/index.ts`
   - Ensure `RESEND_API_KEY` environment variable is set

2. **Test the function**:
   ```bash
   curl -X POST https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

3. **Integrate with your signup flow** using the examples above

## Email Details

- **From:** `noreply@ufsbd34.fr` (your verified domain)
- **Subject:** "Welcome to UFSBD!"
- **Content:** Basic welcome message with confirmation prompt
- **Provider:** Resend (using your existing API key)

## Notes

- The function accepts POST requests with `{ "email": "user@example.com" }`
- Returns `{ "success": true }` on success or `{ "error": "message" }` on failure
- Uses your existing Resend setup and verified domain
- Works alongside Supabase's built-in auth system