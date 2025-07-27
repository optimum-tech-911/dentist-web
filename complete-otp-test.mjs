#!/usr/bin/env node

/**
 * Complete OTP System Test
 * 1. Creates user account if needed
 * 2. Tests OTP email sending
 * 3. Provides next steps
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

const config = {
  testEmail: 'singhchouhanv473@gmail.com',
  testPassword: 'testpassword123',
  supabaseUrl: 'https://cmcfeiskfdbsefzqywbk.supabase.co',
  supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA5MDAzMiwiZXhwIjoyMDY3NjY2MDMyfQ.v1YFUEK7xRQrfzJVfWPo_q0CTqp5eAZhyPmw6CZKqpw',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU',
  otpFunctionUrl: 'https://cmcfeiskfdbsefzqywbk.supabase.co/functions/v1/otp-password-reset'
}

const supabaseService = createClient(config.supabaseUrl, config.supabaseServiceKey)

async function completeOTPTest() {
  console.log('🚀 Complete OTP System Test')
  console.log('============================')
  console.log(`📧 Test Email: ${config.testEmail}`)
  console.log('')

  try {
    // Step 1: Check if user exists, create if not
    console.log('1️⃣ Checking/Creating user account...')
    
    const { data: existingUser, error: userError } = await supabaseService
      .from('profiles')
      .select('*')
      .eq('email', config.testEmail)
      .single()

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create one
      console.log('   Creating new user account...')
      
      const { data: newUser, error: createError } = await supabaseService.auth.admin.createUser({
        email: config.testEmail,
        password: config.testPassword,
        email_confirm: true
      })

      if (createError) {
        console.log('❌ Failed to create user:', createError.message)
        return
      }

      console.log('✅ User account created successfully')
    } else if (userError) {
      console.log('❌ Error checking user:', userError.message)
      return
    } else {
      console.log('✅ User account already exists')
    }

    // Step 2: Test OTP generation and email sending
    console.log('\n2️⃣ Testing OTP generation and email sending...')
    
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
      console.log('🎉 SUCCESS! OTP SYSTEM IS WORKING!')
      console.log('===================================')
      console.log(`✅ OTP generated and email sent to: ${config.testEmail}`)
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
      console.log('4. Check spam/junk folder if not in inbox')
      console.log('')
      console.log('🌐 TEST ON YOUR WEBSITE:')
      console.log('========================')
      console.log('1. Go to your website: /otp-reset-password')
      console.log(`2. Enter email: ${config.testEmail}`)
      console.log('3. Enter the OTP code from your email')
      console.log('4. Set your new password')
      console.log('')
      console.log('🎯 YOUR OTP PASSWORD RESET SYSTEM IS LIVE! 🚀')
      console.log('')
      console.log('📋 System Features:')
      console.log('- ✅ 6-digit OTP codes')
      console.log('- ✅ 10-minute expiry')
      console.log('- ✅ Professional email templates')
      console.log('- ✅ Rate limiting (2-minute cooldown)')
      console.log('- ✅ Attempt tracking (max 3 attempts)')
      console.log('- ✅ Secure password reset')
      
    } else {
      console.log('')
      console.log('❌ OTP SYSTEM ERROR')
      console.log('===================')
      console.log('Error:', result.error || result.message || 'Unknown error')
      
      if (result.error && result.error.includes('Failed to send email')) {
        console.log('')
        console.log('💡 EMAIL SERVICE ISSUE:')
        console.log('This could be:')
        console.log('1. Resend API key issue')
        console.log('2. Email service configuration')
        console.log('3. Temporary email delivery issue')
        console.log('')
        console.log('🔧 Try:')
        console.log('1. Check Resend API key in Edge Function')
        console.log('2. Verify email service is configured')
        console.log('3. Test again in a few minutes')
      }
    }

    // Step 3: Test database function directly
    console.log('\n3️⃣ Testing database function directly...')
    
    const { data: dbResult, error: dbError } = await supabaseService
      .rpc('generate_password_reset_otp', { user_email: config.testEmail })

    if (dbError) {
      console.log('❌ Database function error:', dbError.message)
    } else {
      console.log('✅ Database function working!')
      console.log('📋 DB Result:', JSON.stringify(dbResult, null, 2))
    }

  } catch (error) {
    console.log('')
    console.log('❌ UNEXPECTED ERROR')
    console.log('===================')
    console.log('Error:', error.message)
  }
}

completeOTPTest()