#!/usr/bin/env node

/**
 * Test Verified Domain Email Service
 */

import fetch from 'node-fetch'

async function testVerifiedEmail() {
  console.log('📧 Testing ufsbd34.fr Domain Email Service')
  console.log('=========================================')
  
  const testOTP = '123456'
  const testEmail = 'singhchouhanv473@gmail.com'
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_PKY25c41_AZLTLYzknWWNygBm9eacocSt',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'UFSBD Hérault <noreply@ufsbd34.fr>',
        to: testEmail,
        subject: 'Test OTP - Code de vérification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">UFSBD Hérault</h1>
              <p style="color: #6b7280; margin: 5px 0;">Union Française pour la Santé Bucco-Dentaire</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <h2 style="color: #1e293b; margin-top: 0;">Code de vérification OTP</h2>
              
              <p style="color: #374151; line-height: 1.6;">Bonjour,</p>
              
              <p style="color: #374151; line-height: 1.6;">
                Voici votre code de vérification de test :
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${testOTP}
                </div>
              </div>
              
              <p style="color: #374151; line-height: 1.6;">
                Ceci est un email de test avec le domaine vérifié ufsbd34.fr
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
                Cet email a été envoyé par UFSBD Hérault<br>
                <strong>Contact :</strong> contact@ufsbd34.fr<br>
                <strong>Site web :</strong> <a href="https://ufsbd34.fr" style="color: #2563eb;">ufsbd34.fr</a>
              </p>
            </div>
          </div>
        `
      })
    })

    console.log(`📊 Response Status: ${response.status}`)
    
    const result = await response.json()
    console.log('📋 Response:', JSON.stringify(result, null, 2))

    if (response.ok) {
      console.log('')
      console.log('🎉 SUCCESS! ufsbd34.fr email is working!')
      console.log('📧 Check your email for the beautiful OTP message')
      console.log(`🔢 Test OTP sent: ${testOTP}`)
      console.log('')
      console.log('✅ This means your OTP system should work now!')
      console.log('🚀 Try the /otp-reset-password page again')
    } else {
      console.log('')
      console.log('❌ FAILED! Domain verification issue')
      console.log('Error details:', result)
    }

  } catch (error) {
    console.log('')
    console.log('❌ NETWORK ERROR')
    console.log('Error:', error.message)
  }
}

testVerifiedEmail()