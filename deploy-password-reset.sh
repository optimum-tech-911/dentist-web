#!/bin/bash

# Supabase Edge Function Deployment Script for Password Reset
# Make sure you're logged in first: npx supabase login

echo "🚀 Deploying Supabase Edge Function: password-reset"
echo "Project ID: cmcfeiskfdbsefzqywbk"
echo ""

# Check if logged in
echo "Checking Supabase authentication..."
npx supabase projects list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Supabase. Please run: npx supabase login"
    exit 1
fi

echo "✅ Authenticated with Supabase"

# Deploy the function
echo "Deploying password-reset function..."
npx supabase functions deploy password-reset --project-ref cmcfeiskfdbsefzqywbk

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Password reset function deployed successfully!"
    echo "Function URL: https://cmcfeiskfdbsefzqywbk.functions.supabase.co/password-reset"
    echo ""
    echo "Test with:"
    echo "curl -X POST https://cmcfeiskfdbsefzqywbk.functions.supabase.co/password-reset \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"email\":\"test@example.com\",\"resetLink\":\"https://ufsbd34.fr/reset-password?email=test@example.com&token=test123\"}'"
    echo ""
    echo "📧 The function will send real emails using Resend API!"
else
    echo "❌ Deployment failed. Check the error above."
    exit 1
fi