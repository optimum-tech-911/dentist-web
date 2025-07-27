#!/usr/bin/env node

/**
 * OTP System Debug Script
 * Tests each component to identify the issue
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
const supabaseAnon = createClient(config.supabaseUrl, config.supabaseAnonKey)

async function debugOTPSystem() {
  console.log('🔍 OTP System Debug Analysis')
  console.log('============================')
  console.log(`📧 Test Email: ${config.testEmail}`)
  console.log('')

  const results = {
    userExists: false,
    dbFunctionWorks: false,
    edgeFunctionWorks: false,
    emailServiceWorks: false
  }

  try {
    // Step 1: Check if user exists in auth.users
    console.log('1️⃣ Checking user in auth.users...')
    
    const { data: authUsers, error: authError } = await supabaseService
      .from('auth.users')
      .select('*')
      .eq('email', config.testEmail)

    if (authError) {
      console.log('❌ Cannot access auth.users directly:', authError.message)
      
      // Try alternative method - check if user can be created
      console.log('   Trying to create user account...')
      
      const { data: newUser, error: createError } = await supabaseService.auth.admin.createUser({
        email: config.testEmail,
        password: config.testPassword,
        email_confirm: true
      })

      if (createError) {
        if (createError.message.includes('already registered')) {
          console.log('✅ User already exists (confirmed via create attempt)')
          results.userExists = true
        } else {
          console.log('❌ User creation failed:', createError.message)
        }
      } else {
        console.log('✅ User created successfully')
        results.userExists = true
      }
    } else {
      if (authUsers && authUsers.length > 0) {
        console.log('✅ User found in auth.users')
        results.userExists = true
      } else {
        console.log('❌ User not found in auth.users')
      }
    }

    // Step 2: Test database function directly
    console.log('\n2️⃣ Testing database function...')
    
    const { data: dbResult, error: dbError } = await supabaseAnon
      .rpc('generate_password_reset_otp', { user_email: config.testEmail })

    if (dbError) {
      console.log('❌ Database function error:', dbError.message)
      console.log('   This suggests the SQL functions are not properly deployed')
    } else {
      console.log('✅ Database function working!')
      console.log('📋 DB Result:', JSON.stringify(dbResult, null, 2))
      results.dbFunctionWorks = true
      
      if (dbResult.success) {
        console.log(`🔢 Generated OTP: ${dbResult.otp_code}`)
      }
    }

    // Step 3: Test Edge Function
    console.log('\n3️⃣ Testing Edge Function...')
    
    const response = await fetch(config.otpFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'apikey': config.supabaseAnonKey
      },
      body: JSON.stringify({ email: config.testEmail })
    })

    console.log(`📊 Edge Function Status: ${response.status}`)
    
    const edgeResult = await response.json()
    console.log('📋 Edge Function Response:', JSON.stringify(edgeResult, null, 2))

    if (edgeResult.success) {
      console.log('✅ Edge Function working!')
      results.edgeFunctionWorks = true
      results.emailServiceWorks = true
    } else {
      console.log('❌ Edge Function failed')
      
      if (edgeResult.error) {
        if (edgeResult.error.includes('User not found')) {
          console.log('💡 Issue: User account doesn\'t exist in database')
        } else if (edgeResult.error.includes('Failed to send email')) {
          console.log('💡 Issue: Email service problem (Resend API)')
          results.edgeFunctionWorks = true // Function works, email service doesn't
        } else if (edgeResult.error.includes('function')) {
          console.log('💡 Issue: Database function problem')
        }
      }
    }

    // Step 4: Check OTP table
    console.log('\n4️⃣ Checking OTP records...')
    
    const { data: otpRecords, error: otpError } = await supabaseService
      .from('otp_password_reset')
      .select('*')
      .eq('user_email', config.testEmail)
      .order('created_at', { ascending: false })
      .limit(5)

    if (otpError) {
      console.log('❌ Cannot access OTP table:', otpError.message)
    } else {
      console.log(`✅ Found ${otpRecords.length} OTP records`)
      if (otpRecords.length > 0) {
        console.log('📋 Latest OTP record:')
        const latest = otpRecords[0]
        console.log(`   Code: ${latest.otp_code}`)
        console.log(`   Created: ${latest.created_at}`)
        console.log(`   Expires: ${latest.expires_at}`)
        console.log(`   Used: ${latest.used}`)
        console.log(`   Attempts: ${latest.attempts}`)
      }
    }

    // Step 5: Summary and recommendations
    console.log('\n🎯 DIAGNOSIS SUMMARY')
    console.log('===================')
    console.log(`User Exists: ${results.userExists ? '✅' : '❌'}`)
    console.log(`DB Function: ${results.dbFunctionWorks ? '✅' : '❌'}`)
    console.log(`Edge Function: ${results.edgeFunctionWorks ? '✅' : '❌'}`)
    console.log(`Email Service: ${results.emailServiceWorks ? '✅' : '❌'}`)

    console.log('\n💡 RECOMMENDATIONS:')
    
    if (!results.userExists) {
      console.log('1. Create user account first:')
      console.log('   - Go to /auth page on your website')
      console.log(`   - Sign up with: ${config.testEmail}`)
      console.log('   - Confirm email if required')
    }
    
    if (!results.dbFunctionWorks) {
      console.log('2. Database functions need to be fixed:')
      console.log('   - Re-run the SQL migration in Supabase')
      console.log('   - Check function permissions')
    }
    
    if (!results.edgeFunctionWorks) {
      console.log('3. Edge Function needs debugging:')
      console.log('   - Check Supabase function logs')
      console.log('   - Verify function deployment')
    }
    
    if (!results.emailServiceWorks) {
      console.log('4. Email service needs fixing:')
      console.log('   - Check Resend API key')
      console.log('   - Verify email service configuration')
      console.log('   - Check spam folder')
    }

    if (results.userExists && results.dbFunctionWorks && results.edgeFunctionWorks && results.emailServiceWorks) {
      console.log('🎉 ALL SYSTEMS WORKING!')
      console.log('   The issue might be:')
      console.log('   - Email in spam folder')
      console.log('   - Email delivery delay')
      console.log('   - Frontend route issue')
    }

  } catch (error) {
    console.log('\n❌ UNEXPECTED ERROR')
    console.log('===================')
    console.log('Error:', error.message)
    console.log('Stack:', error.stack)
  }
}

debugOTPSystem()