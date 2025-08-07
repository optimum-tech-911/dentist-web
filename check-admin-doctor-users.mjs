#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAdminDoctorUsers() {
  try {
    console.log('👥 Checking for admin and doctor users...');
    
    // Check users table for admin/doctor roles
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log(`📊 Found ${users?.length || 0} total users:`);
    
    if (users && users.length > 0) {
      const admins = users.filter(u => u.role === 'admin');
      const doctors = users.filter(u => u.role === 'doctor');
      const authors = users.filter(u => u.role === 'author');
      const viewers = users.filter(u => u.role === 'viewer');
      
      console.log(`   👑 Admins: ${admins.length}`);
      admins.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.email} (ID: ${user.id})`);
      });
      
      console.log(`   🩺 Doctors: ${doctors.length}`);
      doctors.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.email} (ID: ${user.id})`);
      });
      
      console.log(`   ✍️  Authors: ${authors.length}`);
      authors.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.email} (ID: ${user.id})`);
      });
      
      console.log(`   👀 Viewers: ${viewers.length}`);
      viewers.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.email} (ID: ${user.id})`);
      });
      
      console.log(`   ❓ Others: ${users.length - admins.length - doctors.length - authors.length - viewers.length}`);
      
      // Check if we have any admin/doctor users
      if (admins.length === 0 && doctors.length === 0) {
        console.log('\n⚠️  WARNING: No admin or doctor users found!');
        console.log('💡 You need to create an admin or doctor user to test the EditBlog functionality.');
        console.log('💡 You can do this by:');
        console.log('   1. Going to the Supabase Dashboard');
        console.log('   2. Navigate to Authentication > Users');
        console.log('   3. Create a new user or update an existing user\'s role');
        console.log('   4. Set the role to "admin" or "doctor"');
      } else {
        console.log('\n✅ Found admin/doctor users!');
        console.log('💡 These users will be able to edit any post after applying the policy.');
      }
    } else {
      console.log('   No users found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
checkAdminDoctorUsers();