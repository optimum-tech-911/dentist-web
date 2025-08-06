#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUserRoles() {
  try {
    console.log('🔍 Checking user roles...');
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching users:', error);
      return;
    }
    
    console.log(`📝 Found ${users.length} users`);
    
    if (users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    console.log('\n👥 All users:');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role || 'No role'}`);
      console.log(`   Created: ${user.created_at}`);
    });
    
    // Check for users with specific roles
    const authors = users.filter(u => u.role === 'author');
    const admins = users.filter(u => u.role === 'admin');
    const doctors = users.filter(u => u.role === 'doctor');
    
    console.log(`\n📊 Role breakdown:`);
    console.log(`   Authors: ${authors.length}`);
    console.log(`   Admins: ${admins.length}`);
    console.log(`   Doctors: ${doctors.length}`);
    console.log(`   Others: ${users.length - authors.length - admins.length - doctors.length}`);
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

// Run the check
checkUserRoles();