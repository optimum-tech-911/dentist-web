#!/bin/bash

# Supabase Edge Function Deployment Script
# Make sure you're logged in first: npx supabase login

echo "🚀 Deploying Supabase Edge Function: send-confirmation"
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
echo "Deploying send-confirmation function..."
npx supabase functions deploy send-confirmation --project-ref cmcfeiskfdbsefzqywbk

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Function deployed successfully!"
    echo "Function URL: https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation"
    echo ""
    echo "Test with:"
    echo "curl -X POST https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"email\":\"test@example.com\"}'"
else
    echo "❌ Deployment failed. Check the error above."
    exit 1
fi