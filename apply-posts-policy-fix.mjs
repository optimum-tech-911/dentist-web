#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyPostsPolicyFix() {
  try {
    console.log('🔧 Applying posts policy fix...');
    
    // SQL to fix the posts update policy
    const sql = `
      -- Drop the existing restrictive policy
      DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;
      
      -- Create a new policy that allows admins to update any post fields
      CREATE POLICY "Admins can update posts" ON public.posts
        FOR UPDATE USING (public.get_current_user_role() = 'admin');
    `;
    
    console.log('📝 Executing SQL...');
    console.log(sql);
    
    // Execute the SQL using rpc (we'll use a different approach)
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error applying policy fix:', error);
      console.log('⚠️  This might be because the rpc function doesn\'t exist.');
      console.log('💡 You may need to apply this manually in the Supabase dashboard.');
      return;
    }
    
    console.log('✅ Policy fix applied successfully!');
    console.log('📊 Result:', data);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('💡 You may need to apply this manually in the Supabase dashboard.');
  }
}

// Run the fix
applyPostsPolicyFix();