# 🚀 Complete Supabase Email Confirmation Setup

## ✅ What's Already Done

1. **Supabase Edge Function Created**: `supabase/functions/send-confirmation/`
2. **Resend API Key Configured**: Set in `supabase/.env`
3. **Enhanced Function**: Includes CORS, validation, and better error handling
4. **React Hook Created**: `src/hooks/useEmailConfirmation.ts`
5. **Deployment Script**: `deploy-function.sh`

## 🔧 Next Steps

### 1. Deploy the Edge Function

**Option A: Using the deployment script**
```bash
# Make sure you're logged in first
npx supabase login

# Run the deployment script
./deploy-function.sh
```

**Option B: Manual deployment**
```bash
# Login to Supabase
npx supabase login

# Deploy the function
npx supabase functions deploy send-confirmation --project-ref cmcfeiskfdbsefzqywbk
```

### 2. Set Environment Variables in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk)
2. Navigate to **Settings** → **Edge Functions**
3. Add environment variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_PKY25c41_AZLTLYzknWWNygBm9eacocSt`

### 3. Test the Function

```bash
# Test the deployed function
curl -X POST https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","name":"Test User"}'
```

## 🎯 Usage in Your React App

### Using the Custom Hook

```typescript
import { useEmailConfirmation } from './hooks/useEmailConfirmation'

const SignupForm = () => {
  const { sendConfirmationEmail, isLoading, error, success } = useEmailConfirmation()

  const handleSubmit = async (formData: { email: string, name: string }) => {
    // Your signup logic here...
    
    // Send confirmation email
    const result = await sendConfirmationEmail(formData.email, formData.name)
    
    if (result.success) {
      alert('Welcome! Please check your email for confirmation.')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      
      {isLoading && <p>Sending confirmation email...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {success && <p className="text-green-500">Email sent successfully!</p>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

### Direct API Call (Alternative)

```typescript
const sendConfirmationEmail = async (email: string, name?: string) => {
  try {
    const response = await fetch(
      'https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      }
    )

    const result = await response.json()
    
    if (result.success) {
      console.log('Email sent:', result.emailId)
      return { success: true }
    } else {
      console.error('Failed:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('Network error:', error)
    return { success: false, error: 'Network error' }
  }
}
```

## 📧 Email Template Features

The email includes:
- ✅ Professional HTML styling
- ✅ Personalized greeting (if name provided)
- ✅ Dental health platform branding
- ✅ Feature highlights
- ✅ Responsive design

## 🔒 Security Features

- ✅ **CORS enabled** for web requests
- ✅ **Email validation** (format checking)
- ✅ **Request method validation** (POST only)
- ✅ **Error handling** with proper HTTP status codes
- ✅ **Input sanitization**

## 🌐 Function URL

**Production**: `https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation`

## 🛠 Troubleshooting

### Common Issues

1. **"Access token not provided"**
   - Run `npx supabase login` first

2. **"RESEND_API_KEY not found"**
   - Set the environment variable in Supabase Dashboard

3. **CORS errors**
   - Function includes CORS headers, should work from any domain

4. **Email not sending**
   - Check Resend dashboard for delivery status
   - Verify domain `ufsbd34.fr` is verified in Resend

### Debug Mode

Add `--debug` flag to any Supabase command:
```bash
npx supabase functions deploy send-confirmation --project-ref cmcfeiskfdbsefzqywbk --debug
```

## 📊 Monitoring

- **Supabase Dashboard**: Monitor function invocations and errors
- **Resend Dashboard**: Track email delivery and opens
- **Browser DevTools**: Check network requests and responses

---

## 🎉 You're All Set!

Your email confirmation system is ready to go. Just deploy the function and start using it in your app!