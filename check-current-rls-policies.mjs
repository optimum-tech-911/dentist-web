import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking current RLS policies on posts table...\n');

  try {
    // Query to get RLS policies
    const { data, error } = await supabase
      .rpc('get_policies', { table_name: 'posts' });

    if (error) {
      console.log('❌ Error getting policies via RPC, trying direct query...');
      
      // Try a different approach - query the information schema
      const { data: policyData, error: policyError } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_name', 'posts')
        .eq('table_schema', 'public');

      if (policyError) {
        console.error('❌ Error querying policies:', policyError);
        return;
      }

      console.log('📋 Current RLS policies on posts table:');
      if (policyData && policyData.length > 0) {
        policyData.forEach((policy, index) => {
          console.log(`\n${index + 1}. Policy: ${policy.policy_name}`);
          console.log(`   Action: ${policy.action}`);
          console.log(`   Command: ${policy.command}`);
          console.log(`   Definition: ${policy.definition}`);
        });
      } else {
        console.log('⚠️  No policies found or table not found');
      }
    } else {
      console.log('📋 Policies:', data);
    }

    // Also check if RLS is enabled
    console.log('\n🔒 Checking if RLS is enabled...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('table_name, row_security')
      .eq('table_name', 'posts')
      .eq('table_schema', 'public');

    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
    } else {
      console.log('📋 RLS status:', rlsData);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRLSPolicies();