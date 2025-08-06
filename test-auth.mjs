#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  try {
    console.log('🔍 Testing authentication...');
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('❌ No active session - user not logged in');
      return;
    }
    
    console.log('✅ User is logged in');
    console.log('📧 Email:', session.user.email);
    console.log('🆔 User ID:', session.user.id);
    
    // Check if user exists in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.log('❌ User not found in users table');
      console.log('💡 This means the user needs to be added to the users table');
      return;
    }
    
    console.log('✅ User found in database');
    console.log('👤 Role:', userData.role || 'No role assigned');
    console.log('📅 Created:', userData.created_at);
    
    // Check if user has required role for /submit page
    const requiredRoles = ['author', 'admin', 'doctor'];
    const hasRequiredRole = userData.role && requiredRoles.includes(userData.role);
    
    console.log(`🔐 Has required role for /submit: ${hasRequiredRole ? '✅ Yes' : '❌ No'}`);
    
    if (!hasRequiredRole) {
      console.log('💡 User needs one of these roles: author, admin, doctor');
    }
    
  } catch (error) {
    console.error('❌ Error testing auth:', error);
  }
}

// Run the test
testAuth();