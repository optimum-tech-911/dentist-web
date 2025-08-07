#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
  console.log('🔍 Checking current RLS policies...\n');

  try {
    // Check current policies
    const { data: policies, error } = await supabase
      .rpc('get_policies', { table_name: 'posts' });

    if (error) {
      console.log('❌ Error getting policies:', error);
      
      // Try direct query
      const { data: directPolicies, error: directError } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_name', 'posts');

      if (directError) {
        console.log('❌ Direct query also failed:', directError);
        return;
      }
      
      console.log('📋 Current policies:', directPolicies);
    } else {
      console.log('📋 Current policies:', policies);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPolicies();