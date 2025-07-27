#!/usr/bin/env node

/**
 * Live OTP System Test
 * Tests the complete OTP password reset flow with your email
 */

import fetch from 'node-fetch'

const config = {
  testEmail: 'singhchouhanv473@gmail.com',
  otpFunctionUrl: 'https://cmcfeiskfdbsefzqywbk.supabase.co/functions/v1/otp-password-reset',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU'
}

async function testLiveOTP() {
  console.log('🎯 Testing LIVE OTP Password Reset System')
  console.log('==========================================')
  console.log(`📧 Your Email: ${config.testEmail}`)
  console.log('')

  try {
    console.log('📤 Sending OTP to your email...')
    
    const response = await fetch(config.otpFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'apikey': config.supabaseAnonKey
      },
      body: JSON.stringify({ email: config.testEmail })
    })

    console.log(`📊 Response Status: ${response.status}`)
    
    const result = await response.json()
    console.log('📋 Response:', JSON.stringify(result, null, 2))

    if (result.success) {
      console.log('')
      console.log('🎉 SUCCESS! OTP EMAIL SENT!')
      console.log('===========================')
      console.log(`✅ Email sent to: ${config.testEmail}`)
      console.log(`⏰ OTP expires at: ${result.expires_at}`)
      
      const expiryTime = new Date(result.expires_at)
      const now = new Date()
      const minutesUntilExpiry = Math.round((expiryTime - now) / (1000 * 60))
      console.log(`⏳ Valid for: ${minutesUntilExpiry} minutes`)
      
      console.log('')
      console.log('📧 CHECK YOUR EMAIL NOW!')
      console.log('========================')
      console.log('1. Open your email inbox')
      console.log('2. Look for email from "UFSBD Hérault <ufsbd34@ufsbd.fr>"')
      console.log('3. Find the 6-digit OTP code')
      console.log('4. Check spam folder if not in inbox')
      console.log('')
      console.log('🌐 THEN TEST ON YOUR WEBSITE:')
      console.log('==============================')
      console.log('1. Go to: /otp-reset-password')
      console.log(`2. Enter email: ${config.testEmail}`)
      console.log('3. Enter the OTP code from your email')
      console.log('4. Set your new password')
      console.log('')
      console.log('🎯 Your OTP Password Reset System is LIVE! 🚀')
      
    } else {
      console.log('')
      console.log('❌ ERROR - OTP Not Sent')
      console.log('========================')
      console.log('Error:', result.error || result.message || 'Unknown error')
      
      if (result.error && result.error.includes('User not found')) {
        console.log('')
        console.log('💡 SOLUTION: Create a user account first')
        console.log('1. Go to your website /auth page')
        console.log(`2. Sign up with email: ${config.testEmail}`)
        console.log('3. Then try the OTP reset again')
      }
    }

  } catch (error) {
    console.log('')
    console.log('❌ NETWORK ERROR')
    console.log('=================')
    console.log('Error:', error.message)
    console.log('')
    console.log('🔧 Check:')
    console.log('1. Internet connection')
    console.log('2. Supabase Edge Function deployment')
    console.log('3. API keys are correct')
  }
}

testLiveOTP()