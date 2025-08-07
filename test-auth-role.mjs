#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthRole() {
  try {
    console.log('🔍 Testing authentication and role...');
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else if (!session) {
      console.log('⚠️  No active session - user not authenticated');
      console.log('💡 This explains why updates are blocked!');
      console.log('💡 You need to be logged in as an admin/doctor user');
    } else {
      console.log('✅ User is authenticated');
      console.log('👤 User ID:', session.user.id);
      console.log('📧 User email:', session.user.email);
    }
    
    // Try to get user role
    console.log('\n🔍 Checking user role...');
    const { data: userRole, error: roleError } = await supabase
      .rpc('get_current_user_role');
    
    if (roleError) {
      console.log('❌ Could not get user role:', roleError.message);
      console.log('💡 This might be because user is not authenticated or no role assigned');
    } else {
      console.log('✅ User role:', userRole);
    }
    
    // Check if user exists in users table
    if (session) {
      console.log('\n🔍 Checking if user exists in users table...');
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        console.log('❌ User not found in users table:', userError.message);
        console.log('💡 This explains the role issue!');
      } else {
        console.log('✅ User found in users table');
        console.log('👤 User role from table:', user.role);
        console.log('📧 User email from table:', user.email);
      }
    }
    
    console.log('\n💡 Summary:');
    if (!session) {
      console.log('   ❌ User not authenticated - need to login');
    } else if (roleError) {
      console.log('   ❌ User role not accessible - might not be in users table');
    } else {
      console.log('   ✅ User authenticated and has role:', userRole);
    }
    
    console.log('\n🚀 To fix the cover image update:');
    console.log('   1. Login with an admin/doctor user');
    console.log('   2. Make sure the user exists in the users table');
    console.log('   3. Make sure the user has admin or doctor role');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
testAuthRole();