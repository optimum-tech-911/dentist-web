#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCurrentPolicies() {
  try {
    console.log('🔍 Checking current RLS policies for posts table...');
    
    // Try to get the current policies using a direct query
    // Note: This might not work due to RLS restrictions, but let's try
    
    console.log('\n📋 Current policies for posts table:');
    console.log('   (This information should be available in Supabase Dashboard)');
    console.log('   Go to: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/auth/policies');
    
    // Let's test what happens when we try to update with different approaches
    console.log('\n🧪 Testing different update scenarios...');
    
    // Get a post to test with
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError || !posts || posts.length === 0) {
      console.error('❌ No posts found');
      return;
    }
    
    const post = posts[0];
    console.log(`📝 Testing with post: "${post.title}" (Status: ${post.status})`);
    
    // Test 1: Try to update only the image field
    console.log('\n🔄 Test 1: Update only image field...');
    const { data: update1, error: error1 } = await supabase
      .from('posts')
      .update({ image: 'test-image-1.jpg' })
      .eq('id', post.id)
      .select();
    
    console.log('Result 1:', error1 ? `❌ Error: ${error1.message}` : '✅ Success (but check if data changed)');
    
    // Test 2: Try to update only the status field
    console.log('\n🔄 Test 2: Update only status field...');
    const { data: update2, error: error2 } = await supabase
      .from('posts')
      .update({ status: 'pending' })
      .eq('id', post.id)
      .select();
    
    console.log('Result 2:', error2 ? `❌ Error: ${error2.message}` : '✅ Success (but check if data changed)');
    
    // Test 3: Try to update both status and image
    console.log('\n🔄 Test 3: Update both status and image...');
    const { data: update3, error: error3 } = await supabase
      .from('posts')
      .update({ 
        status: 'approved',
        image: 'test-image-3.jpg' 
      })
      .eq('id', post.id)
      .select();
    
    console.log('Result 3:', error3 ? `❌ Error: ${error3.message}` : '✅ Success (but check if data changed)');
    
    // Check final state
    console.log('\n🔍 Checking final post state...');
    const { data: finalPost, error: finalError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post.id)
      .single();
    
    if (finalError) {
      console.error('❌ Error checking final state:', finalError);
    } else {
      console.log('📊 Final post state:');
      console.log(`   Title: "${finalPost.title}"`);
      console.log(`   Status: ${finalPost.status}`);
      console.log(`   Image: "${finalPost.image || 'null'}"`);
    }
    
    console.log('\n💡 Analysis:');
    console.log('   - If all updates "succeed" but data doesn\'t change, RLS is blocking silently');
    console.log('   - If status updates work but image updates don\'t, policy is field-specific');
    console.log('   - Check the Supabase Dashboard for exact policy details');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
checkCurrentPolicies();