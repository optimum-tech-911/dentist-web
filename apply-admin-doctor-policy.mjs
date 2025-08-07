#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyAdminDoctorPolicy() {
  try {
    console.log('🔧 Applying admin/doctor posts policy...');
    
    // SQL to add the admin/doctor policy
    const sql = `
      -- Drop the existing restrictive policy
      DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;
      
      -- Create a new policy that allows admins and doctors to update any post fields
      CREATE POLICY "Admins and doctors can update posts" ON public.posts
        FOR UPDATE USING (public.get_current_user_role() IN ('admin', 'doctor'));
    `;
    
    console.log('📝 SQL to execute:');
    console.log(sql);
    
    console.log('\n💡 This SQL needs to be run manually in the Supabase Dashboard SQL Editor.');
    console.log('💡 Go to: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql');
    console.log('💡 Copy and paste the SQL above and run it.');
    
    console.log('\n📋 After applying this policy:');
    console.log('✅ Admin users can update any post (including approved posts)');
    console.log('✅ Doctor users can update any post (including approved posts)');
    console.log('✅ Authors can still update their own pending posts');
    console.log('✅ EditBlog cover image updates will work for admin/doctor users');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
applyAdminDoctorPolicy();