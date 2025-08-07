#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPolicyCheck() {
  console.log('🔍 Testing policy and update behavior...\n');

  try {
    // Get a post to test with
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, status, author_id')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with: "${post.title}"`);
    console.log(`📋 Current cover: "${post.image || 'null'}"`);
    console.log(`📋 Status: ${post.status}`);
    console.log(`📋 Author ID: ${post.author_id}`);

    // Test 1: Try to update status (this should work)
    console.log('\n🔄 Test 1: Update status only...');
    const { data: statusUpdate, error: statusError } = await supabase
      .from('posts')
      .update({ status: 'pending' })
      .eq('id', post.id)
      .select();

    if (statusError) {
      console.error('❌ Status update failed:', statusError);
    } else {
      console.log('✅ Status update appeared successful');
    }

    // Test 2: Try to update image only
    console.log('\n🔄 Test 2: Update image only...');
    const testImage = `policy_test_${Date.now()}.jpg`;
    const { data: imageUpdate, error: imageError } = await supabase
      .from('posts')
      .update({ image: testImage })
      .eq('id', post.id)
      .select();

    if (imageError) {
      console.error('❌ Image update failed:', imageError);
      console.error('❌ Error code:', imageError.code);
      console.error('❌ Error message:', imageError.message);
    } else {
      console.log('✅ Image update appeared successful');
    }

    // Test 3: Try to update both status and image
    console.log('\n🔄 Test 3: Update both status and image...');
    const { data: bothUpdate, error: bothError } = await supabase
      .from('posts')
      .update({ 
        status: 'approved',
        image: `both_test_${Date.now()}.jpg`
      })
      .eq('id', post.id)
      .select();

    if (bothError) {
      console.error('❌ Both update failed:', bothError);
    } else {
      console.log('✅ Both update appeared successful');
    }

    // Check final state
    console.log('\n🔍 Checking final state...');
    const { data: finalPost, error: finalError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .eq('id', post.id)
      .single();

    if (finalError) {
      console.error('❌ Error checking final state:', finalError);
    } else {
      console.log('📋 Final post state:');
      console.log(`   Title: "${finalPost.title}"`);
      console.log(`   Status: ${finalPost.status}`);
      console.log(`   Cover: "${finalPost.image || 'null'}"`);
      
      console.log('\n📊 Analysis:');
      console.log(`   Status changed: ${finalPost.status !== post.status}`);
      console.log(`   Image changed: ${finalPost.image !== post.image}`);
      
      if (finalPost.status !== post.status && finalPost.image === post.image) {
        console.log('💡 Status updates work, but image updates are blocked');
        console.log('💡 This suggests the policy allows status but not field updates');
      } else if (finalPost.image !== post.image) {
        console.log('✅ Image updates work!');
      } else {
        console.log('❌ No updates worked');
      }
    }

    // Restore original
    await supabase
      .from('posts')
      .update({ 
        status: post.status,
        image: post.image 
      })
      .eq('id', post.id);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPolicyCheck();