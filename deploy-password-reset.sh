#!/bin/bash

echo "🚀 Deploying password-reset function to Supabase..."

# Deploy the password-reset function
npx supabase functions deploy password-reset --project-ref cmcfeiskfdbsefzqywbk

echo "✅ Password reset function deployed!"
echo "📧 Function URL: https://cmcfeiskfdbsefzqywbk.functions.supabase.co/password-reset"
echo ""
echo "🧪 Test the password reset:"
echo "1. Go to /auth"
echo "2. Click 'Forgot Password?'"
echo "3. Enter your email"
echo "4. Check your email for the reset link"