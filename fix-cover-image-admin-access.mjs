#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAdminAccess() {
  try {
    console.log('🔍 Testing admin access approach...');
    
    // Check if we can access the admin access system
    console.log('\n📋 Admin emails from system:');
    const adminEmails = [
      'admin@ufsbd34.fr',
      'doctor@ufsbd34.fr',
      'amelie.cherbonneau@example.com',
      'abdessamed.abdessadok@example.com',
      'helene.sabatier@example.com',
      'alexandre.yeche@example.com',
      'pascal.rouzeyre@example.com',
      'vincent.tiers@example.com',
    ];
    
    adminEmails.forEach(email => {
      console.log(`   - ${email}`);
    });
    
    console.log('\n💡 The issue might be that the RLS policy change didn\'t work.');
    console.log('💡 Let\'s try a different approach...');
    
    // Try to create a service role client (this bypasses RLS)
    console.log('\n🔄 Trying service role approach...');
    
    // Note: We don't have service role key, but let's check what we can do
    
    console.log('\n🚀 Next steps to fix this:');
    console.log('   1. Check if the SQL policy change was applied successfully');
    console.log('   2. If not, try applying it again');
    console.log('   3. If it still doesn\'t work, we might need to use a different approach');
    
    console.log('\n📋 SQL to apply (if not already applied):');
    console.log(`
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;

-- Create a new policy that allows admin panel users to update any post fields
CREATE POLICY "Admin panel users can update posts" ON public.posts
  FOR UPDATE USING (
    public.get_current_user_role() IN ('admin', 'doctor', 'president', 'secretaire', 'tresorier')
  );
    `);
    
    console.log('\n🔍 To check if the policy was applied:');
    console.log('   Go to: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/auth/policies');
    console.log('   Look for the posts table and check if the policy was updated');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
testAdminAccess();