#!/bin/bash

echo "🚀 Deploying reset-pass-email function to Supabase..."

# Deploy the reset-pass-email function
npx supabase functions deploy reset-pass-email --project-ref cmcfeiskfdbsefzqywbk

echo "✅ Password reset function deployed!"
echo "📧 Function URL: https://cmcfeiskfdbsefzqywbk.functions.supabase.co/reset-pass-email"
echo ""
echo "🧪 Test the password reset:"
echo "1. Go to /auth"
echo "2. Click 'Forgot Password?'"
echo "3. Enter your email"
echo "4. Check your email for the reset link"