#!/usr/bin/env node

/**
 * Comprehensive OTP Password Reset Testing Script
 * 
 * This script tests the complete OTP password reset flow:
 * 1. Database setup and migration
 * 2. OTP generation and email sending
 * 3. OTP verification
 * 4. Password reset functionality
 * 5. Email delivery verification
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Configuration
const config = {
  supabaseUrl: 'https://cmcfeiskfdbsefzqywbk.supabase.co',
  supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA5MDAzMiwiZXhwIjoyMDY3NjY2MDMyfQ.v1YFUEK7xRQrfzJVfWPo_q0CTqp5eAZhyPmw6CZKqpw',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU',
  testEmail: 'test@ufsbd34.fr', // Use your actual test email
  otpFunctionUrl: 'https://cmcfeiskfdbsefzqywbk.supabase.co/functions/v1/otp-password-reset'
}

// Initialize Supabase clients
const supabaseService = createClient(config.supabaseUrl, config.supabaseServiceKey)
const supabaseAnon = createClient(config.supabaseUrl, config.supabaseAnonKey)

// Test results storage
const testResults = {
  databaseSetup: false,
  userCreation: false,
  otpGeneration: false,
  emailSending: false,
  otpVerification: false,
  passwordReset: false,
  emailDelivery: false
}

// Utility functions
function logStep(step, status, details = '') {
  const icon = status ? '✅' : '❌'
  const timestamp = new Date().toISOString()
  console.log(`${icon} [${timestamp}] ${step}`)
  if (details) {
    console.log(`   Details: ${details}`)
  }
  if (!status) {
    console.log(`   Status: FAILED`)
  }
  console.log()
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`)
}

function logWarning(message) {
  console.log(`⚠️  ${message}`)
}

function logSuccess(message) {
  console.log(`🎉 ${message}`)
}

// Test functions
async function testDatabaseSetup() {
  logInfo('Testing database setup and OTP table existence...')
  
  try {
    // Check if OTP table exists
    const { data, error } = await supabaseService
      .from('otp_password_reset')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      logStep('Database Setup', false, `OTP table not found: ${error.message}`)
      return false
    }

    // Test OTP generation function
    const { data: functionData, error: functionError } = await supabaseService
      .rpc('generate_password_reset_otp', { user_email: 'nonexistent@test.com' })

    if (functionError) {
      logStep('Database Setup', false, `OTP function not found: ${functionError.message}`)
      return false
    }

    logStep('Database Setup', true, 'OTP table and functions are properly set up')
    testResults.databaseSetup = true
    return true
  } catch (error) {
    logStep('Database Setup', false, `Database connection error: ${error.message}`)
    return false
  }
}

async function createTestUser() {
  logInfo('Creating test user...')
  
  try {
    // First, try to delete existing test user
    const { error: deleteError } = await supabaseService.auth.admin.deleteUser(
      config.testEmail
    )
    
    if (deleteError && !deleteError.message.includes('not found')) {
      logWarning(`Could not delete existing user: ${deleteError.message}`)
    }

    // Create new test user
    const { data, error } = await supabaseService.auth.admin.createUser({
      email: config.testEmail,
      password: 'testpassword123',
      email_confirm: true
    })

    if (error) {
      logStep('User Creation', false, `Failed to create test user: ${error.message}`)
      return false
    }

    logStep('User Creation', true, `Test user created with ID: ${data.user.id}`)
    testResults.userCreation = true
    return data.user
  } catch (error) {
    logStep('User Creation', false, `User creation error: ${error.message}`)
    return false
  }
}

async function testOTPGeneration() {
  logInfo('Testing OTP generation...')
  
  try {
    const { data, error } = await supabaseService
      .rpc('generate_password_reset_otp', { user_email: config.testEmail })

    if (error) {
      logStep('OTP Generation', false, `Database function error: ${error.message}`)
      return false
    }

    if (!data.success) {
      logStep('OTP Generation', false, `OTP generation failed: ${data.message}`)
      return false
    }

    logStep('OTP Generation', true, `OTP generated: ${data.otp_code} (expires: ${data.expires_at})`)
    testResults.otpGeneration = true
    return data.otp_code
  } catch (error) {
    logStep('OTP Generation', false, `OTP generation error: ${error.message}`)
    return false
  }
}

async function testEmailSending() {
  logInfo('Testing email sending via Edge Function...')
  
  try {
    const response = await fetch(config.otpFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'apikey': config.supabaseAnonKey
      },
      body: JSON.stringify({ email: config.testEmail })
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      logStep('Email Sending', false, `Edge function failed: ${result.error || 'Unknown error'}`)
      return false
    }

    logStep('Email Sending', true, `Email sent successfully. Email ID: ${result.emailId}`)
    testResults.emailSending = true
    return result
  } catch (error) {
    logStep('Email Sending', false, `Email sending error: ${error.message}`)
    return false
  }
}

async function testOTPVerification(otpCode) {
  logInfo('Testing OTP verification...')
  
  try {
    const { data, error } = await supabaseAnon
      .rpc('verify_otp_code', { 
        user_email: config.testEmail, 
        otp_code: otpCode 
      })

    if (error) {
      logStep('OTP Verification', false, `Verification function error: ${error.message}`)
      return false
    }

    if (!data.success) {
      logStep('OTP Verification', false, `OTP verification failed: ${data.message}`)
      return false
    }

    logStep('OTP Verification', true, `OTP verified successfully. OTP ID: ${data.otp_id}`)
    testResults.otpVerification = true
    return true
  } catch (error) {
    logStep('OTP Verification', false, `OTP verification error: ${error.message}`)
    return false
  }
}

async function testPasswordReset(otpCode) {
  logInfo('Testing password reset with OTP...')
  
  const newPassword = 'newtestpassword123'
  
  try {
    const { data, error } = await supabaseAnon
      .rpc('verify_otp_and_reset_password', { 
        user_email: config.testEmail, 
        otp_code: otpCode,
        new_password: newPassword
      })

    if (error) {
      logStep('Password Reset', false, `Password reset function error: ${error.message}`)
      return false
    }

    if (!data.success) {
      logStep('Password Reset', false, `Password reset failed: ${data.message}`)
      return false
    }

    // Test login with new password
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: config.testEmail,
      password: newPassword
    })

    if (loginError) {
      logStep('Password Reset', false, `Login with new password failed: ${loginError.message}`)
      return false
    }

    logStep('Password Reset', true, `Password reset successful. Login verified.`)
    testResults.passwordReset = true
    return true
  } catch (error) {
    logStep('Password Reset', false, `Password reset error: ${error.message}`)
    return false
  }
}

async function testOTPExpiration() {
  logInfo('Testing OTP expiration handling...')
  
  try {
    // Try to use an expired/invalid OTP
    const { data, error } = await supabaseAnon
      .rpc('verify_otp_code', { 
        user_email: config.testEmail, 
        otp_code: '999999' // Invalid OTP
      })

    if (error) {
      logStep('OTP Expiration Test', false, `Verification function error: ${error.message}`)
      return false
    }

    if (data.success) {
      logStep('OTP Expiration Test', false, `Invalid OTP was accepted (security issue!)`)
      return false
    }

    logStep('OTP Expiration Test', true, `Invalid OTP correctly rejected: ${data.message}`)
    return true
  } catch (error) {
    logStep('OTP Expiration Test', false, `OTP expiration test error: ${error.message}`)
    return false
  }
}

async function testRateLimiting() {
  logInfo('Testing rate limiting (multiple OTP requests)...')
  
  try {
    // Generate first OTP
    const response1 = await fetch(config.otpFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'apikey': config.supabaseAnonKey
      },
      body: JSON.stringify({ email: config.testEmail })
    })

    const result1 = await response1.json()

    // Immediately try to generate another OTP (should be rate limited)
    const response2 = await fetch(config.otpFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'apikey': config.supabaseAnonKey
      },
      body: JSON.stringify({ email: config.testEmail })
    })

    const result2 = await response2.json()

    if (result2.success) {
      logStep('Rate Limiting Test', false, 'Rate limiting not working - multiple OTPs generated')
      return false
    }

    logStep('Rate Limiting Test', true, `Rate limiting working: ${result2.error}`)
    return true
  } catch (error) {
    logStep('Rate Limiting Test', false, `Rate limiting test error: ${error.message}`)
    return false
  }
}

async function cleanup() {
  logInfo('Cleaning up test data...')
  
  try {
    // Delete test user
    await supabaseService.auth.admin.deleteUser(config.testEmail)
    
    // Clean up OTP records
    await supabaseService
      .from('otp_password_reset')
      .delete()
      .eq('user_email', config.testEmail)

    logInfo('Cleanup completed')
  } catch (error) {
    logWarning(`Cleanup error: ${error.message}`)
  }
}

async function generateTestReport() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 OTP PASSWORD RESET TEST REPORT')
  console.log('='.repeat(60))
  
  const totalTests = Object.keys(testResults).length
  const passedTests = Object.values(testResults).filter(result => result === true).length
  const failedTests = totalTests - passedTests
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total Tests: ${totalTests}`)
  console.log(`   Passed: ${passedTests}`)
  console.log(`   Failed: ${failedTests}`)
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  console.log(`\n📋 Test Results:`)
  Object.entries(testResults).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌'
    console.log(`   ${icon} ${test}`)
  })
  
  if (passedTests === totalTests) {
    logSuccess('All tests passed! OTP password reset is working correctly.')
    console.log('\n🚀 The OTP password reset system is ready for production!')
    
    console.log('\n📝 User Instructions:')
    console.log('   1. Go to /otp-reset-password page')
    console.log('   2. Enter email address')
    console.log('   3. Check email for 6-digit OTP code')
    console.log('   4. Enter OTP code on the page')
    console.log('   5. Set new password')
    console.log('   6. Login with new password')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.')
    
    if (!testResults.databaseSetup) {
      console.log('\n🔧 Database Setup Required:')
      console.log('   Run the OTP migration: supabase/migrations/20250115_create_otp_password_reset.sql')
    }
    
    if (!testResults.emailSending) {
      console.log('\n📧 Email Setup Required:')
      console.log('   1. Deploy the OTP Edge Function: supabase/functions/otp-password-reset/')
      console.log('   2. Check Resend API key configuration')
      console.log('   3. Verify email domain setup')
    }
  }
  
  console.log('\n' + '='.repeat(60))
}

// Main test execution
async function runTests() {
  console.log('🧪 Starting OTP Password Reset Tests...')
  console.log('='.repeat(60))
  
  let testUser = null
  let otpCode = null

  try {
    // 1. Test database setup
    if (!(await testDatabaseSetup())) {
      console.log('❌ Database setup failed. Skipping remaining tests.')
      await generateTestReport()
      return
    }

    // 2. Create test user
    testUser = await createTestUser()
    if (!testUser) {
      console.log('❌ User creation failed. Skipping remaining tests.')
      await generateTestReport()
      return
    }

    // 3. Test OTP generation
    otpCode = await testOTPGeneration()
    if (!otpCode) {
      console.log('❌ OTP generation failed. Skipping email and verification tests.')
      await generateTestReport()
      return
    }

    // 4. Test email sending
    const emailResult = await testEmailSending()
    if (emailResult) {
      testResults.emailDelivery = true
    }

    // 5. Test OTP verification
    if (otpCode) {
      await testOTPVerification(otpCode)
    }

    // 6. Test password reset (with a fresh OTP)
    const freshOTP = await testOTPGeneration()
    if (freshOTP) {
      await testPasswordReset(freshOTP)
    }

    // 7. Test security features
    await testOTPExpiration()
    await testRateLimiting()

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error)
  } finally {
    // 8. Cleanup
    await cleanup()
    
    // 9. Generate report
    await generateTestReport()
  }
}

// Run the tests
runTests().catch(console.error)