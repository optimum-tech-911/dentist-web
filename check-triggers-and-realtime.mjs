#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggersAndRealtime() {
  console.log('🔍 Checking for triggers and real-time issues...\n');

  try {
    // Get a post to test with
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with: "${post.title}"`);
    console.log(`📋 Current updated_at: ${post.updated_at}`);

    // Test 1: Try to update with a delay to see if it's real-time related
    console.log('\n🔄 Test 1: Update with delay...');
    const testValue = `trigger_test_${Date.now()}`;
    
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ 
        title: testValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
    } else {
      console.log('✅ Update appeared successful');
      console.log('📋 Update response:', updateData);
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check immediately after update
    console.log('\n🔍 Checking immediately after update...');
    const { data: immediateCheck, error: immediateError } = await supabase
      .from('posts')
      .select('title, updated_at')
      .eq('id', post.id)
      .single();

    if (immediateError) {
      console.error('❌ Immediate check failed:', immediateError);
    } else {
      console.log('📋 Immediate result:');
      console.log(`   Title: "${immediateCheck.title}"`);
      console.log(`   Updated_at: ${immediateCheck.updated_at}`);
      console.log(`   Title changed: ${immediateCheck.title !== post.title}`);
    }

    // Wait longer and check again
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🔍 Checking after 3 seconds...');
    const { data: delayedCheck, error: delayedError } = await supabase
      .from('posts')
      .select('title, updated_at')
      .eq('id', post.id)
      .single();

    if (delayedError) {
      console.error('❌ Delayed check failed:', delayedError);
    } else {
      console.log('📋 Delayed result:');
      console.log(`   Title: "${delayedCheck.title}"`);
      console.log(`   Updated_at: ${delayedCheck.updated_at}`);
      console.log(`   Title changed: ${delayedCheck.title !== post.title}`);
    }

    // Test 2: Try to update using RPC to bypass potential triggers
    console.log('\n🔄 Test 2: Try RPC update...');
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('update_post_title', { 
          post_id: post.id, 
          new_title: `rpc_test_${Date.now()}` 
        });

      if (rpcError) {
        console.log('❌ RPC update failed:', rpcError);
        console.log('💡 RPC function might not exist');
      } else {
        console.log('✅ RPC update successful:', rpcData);
      }
    } catch (rpcError) {
      console.log('❌ RPC error:', rpcError.message);
    }

    // Final check
    console.log('\n🔍 Final check...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('posts')
      .select('title, updated_at')
      .eq('id', post.id)
      .single();

    if (finalError) {
      console.error('❌ Final check failed:', finalError);
    } else {
      console.log('📋 Final result:');
      console.log(`   Title: "${finalCheck.title}"`);
      console.log(`   Updated_at: ${finalCheck.updated_at}`);
      console.log(`   Title changed: ${finalCheck.title !== post.title}`);
      
      console.log('\n📊 Analysis:');
      if (finalCheck.title === post.title) {
        console.log('💡 ALL UPDATES ARE BEING REVERTED');
        console.log('💡 This is likely caused by:');
        console.log('   1. Database triggers (most likely)');
        console.log('   2. Supabase real-time subscriptions');
        console.log('   3. Application-level code reverting changes');
        console.log('   4. Database constraints or rules');
        console.log('');
        console.log('🔧 SOLUTION: Check for database triggers in Supabase Dashboard');
        console.log('   Go to: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/database/triggers');
      } else {
        console.log('✅ Updates work!');
      }
    }

    // Restore original
    await supabase
      .from('posts')
      .update({ 
        title: post.title,
        updated_at: post.updated_at
      })
      .eq('id', post.id);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTriggersAndRealtime();