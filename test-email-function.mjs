#!/usr/bin/env node

// Test script for the send-confirmation Edge Function
// Usage: node test-email-function.mjs test@example.com "Test User"

import https from 'https';

const EMAIL = process.argv[2] || 'test@example.com';
const NAME = process.argv[3] || 'Test User';
const FUNCTION_URL = 'https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation';

// You can get this from your Supabase project settings
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const postData = JSON.stringify({
  email: EMAIL,
  name: NAME
});

const options = {
  hostname: 'cmcfeiskfdbsefzqywbk.functions.supabase.co',
  port: 443,
  path: '/send-confirmation',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log(`🧪 Testing send-confirmation function...`);
console.log(`📧 Email: ${EMAIL}`);
console.log(`👤 Name: ${NAME}`);
console.log(`🌐 URL: ${FUNCTION_URL}`);
console.log('');

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('');

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`📄 Response Body:`);
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('\n✅ Test PASSED - Email function is working!');
        if (parsed.emailId) {
          console.log(`📧 Email ID: ${parsed.emailId}`);
        }
      } else {
        console.log('\n❌ Test FAILED - Check the error message above');
        if (parsed.error) {
          console.log(`🚨 Error: ${parsed.error}`);
        }
        if (parsed.details) {
          console.log(`🔍 Details: ${parsed.details}`);
        }
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ Test FAILED - Invalid JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
});

req.write(postData);
req.end();