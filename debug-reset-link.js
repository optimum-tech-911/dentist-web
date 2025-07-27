// Debug Supabase reset link parameters
import fetch from 'node-fetch';

async function debugResetLink() {
  console.log('🔍 Debugging Supabase Reset Link Parameters...');
  
  // Simulate what a real Supabase reset link looks like
  const sampleUrls = [
    'https://ufsbd34.fr/reset-password?access_token=eyJ...&refresh_token=eyJ...&type=recovery',
    'https://ufsbd34.fr/reset-password?access_token=eyJ...&type=recovery',
    'https://ufsbd34.fr/reset-password?token=eyJ...&type=recovery',
    'https://ufsbd34.fr/reset-password?email=ufsbd912@gmail.com&token=eyJ...',
    'https://ufsbd34.fr/reset-password?access_token=eyJ...&refresh_token=eyJ...&type=recovery&email=ufsbd912@gmail.com'
  ];
  
  console.log('📋 Common Supabase reset link formats:');
  sampleUrls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
  
  console.log('\n🔧 Let\'s test the current validation logic...');
  
  // Test current validation logic
  const testCases = [
    {
      name: 'Valid Supabase link',
      params: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        type: 'recovery'
      },
      shouldBeValid: true
    },
    {
      name: 'Link with only access_token',
      params: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
        type: 'recovery'
      },
      shouldBeValid: true
    },
    {
      name: 'Link with email and token',
      params: {
        email: 'ufsbd912@gmail.com',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'
      },
      shouldBeValid: false // Current logic doesn't handle this
    },
    {
      name: 'Empty parameters',
      params: {},
      shouldBeValid: false
    }
  ];
  
  testCases.forEach(testCase => {
    const hasAccessToken = !!testCase.params.access_token;
    const hasType = testCase.params.type === 'recovery';
    const isValid = hasAccessToken && hasType;
    
    console.log(`\n📧 ${testCase.name}:`);
    console.log(`   Parameters:`, testCase.params);
    console.log(`   Current validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Should be: ${testCase.shouldBeValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Status: ${isValid === testCase.shouldBeValid ? '✅ Correct' : '❌ Wrong'}`);
  });
  
  console.log('\n🎯 Recommendations:');
  console.log('1. Accept links with access_token + type=recovery');
  console.log('2. Accept links with email + token (fallback)');
  console.log('3. Accept links with just access_token');
  console.log('4. Show form even if validation fails (for debugging)');
}

// Also test what a real Supabase reset email looks like
async function testSupabaseResetEmail() {
  console.log('\n📧 Testing Supabase Reset Email...');
  
  const SUPABASE_URL = "https://cmcfeiskfdbsefzqywbk.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU";
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: 'ufsbd912@gmail.com',
        gotrue_meta_security: {}
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Reset email sent successfully!');
      console.log('📧 Check your email for the actual link format');
      console.log('📧 The link should contain access_token, refresh_token, and type=recovery');
    } else {
      console.log('❌ Failed to send reset email:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug
console.log('🚀 Starting Reset Link Debug...');
debugResetLink().then(() => {
  return testSupabaseResetEmail();
}).then(() => {
  console.log('\n📋 Next Steps:');
  console.log('1. Check your email for the actual reset link');
  console.log('2. Copy the URL parameters');
  console.log('3. We can update the validation logic based on the real format');
}).catch(console.error);