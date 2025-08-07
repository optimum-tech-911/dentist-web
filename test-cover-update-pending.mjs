#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCoverUpdatePending() {
  try {
    console.log('🧪 Testing cover image update on pending post...');
    
    // Get the existing post
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError || !posts || posts.length === 0) {
      console.error('❌ No posts found');
      return;
    }
    
    const post = posts[0];
    const originalStatus = post.status;
    const originalImage = post.image;
    
    console.log(`📝 Found post: "${post.title}" (ID: ${post.id})`);
    console.log(`   Current status: ${post.status}`);
    console.log(`   Current cover: "${post.image || 'null'}"`);
    
    // Test 1: Try to update cover image while post is approved (should fail due to RLS)
    console.log('\n🔄 Test 1: Updating cover image on approved post...');
    const testImage1 = 'test-cover-1.jpg';
    
    const { data: update1Data, error: update1Error } = await supabase
      .from('posts')
      .update({ image: testImage1 })
      .eq('id', post.id)
      .select();
    
    if (update1Error) {
      console.log('❌ Update failed (expected for approved post):', update1Error.message);
    } else {
      console.log('⚠️  Update succeeded (unexpected for approved post)');
      console.log('📊 Update result:', update1Data);
    }
    
    // Test 2: Change status to pending and try update
    console.log('\n🔄 Test 2: Changing status to pending and updating cover image...');
    
    const { data: statusUpdateData, error: statusUpdateError } = await supabase
      .from('posts')
      .update({ status: 'pending' })
      .eq('id', post.id)
      .select();
    
    if (statusUpdateError) {
      console.log('❌ Status update failed:', statusUpdateError.message);
      console.log('💡 This suggests the RLS policy is working correctly');
      return;
    }
    
    console.log('✅ Status changed to pending');
    
    // Now try to update the cover image
    const testImage2 = 'test-cover-2.jpg';
    
    const { data: update2Data, error: update2Error } = await supabase
      .from('posts')
      .update({ image: testImage2 })
      .eq('id', post.id)
      .select();
    
    if (update2Error) {
      console.log('❌ Cover image update failed:', update2Error.message);
    } else {
      console.log('✅ Cover image update succeeded!');
      console.log('📊 Update result:', update2Data);
    }
    
    // Test 3: Restore original status and image
    console.log('\n🔄 Test 3: Restoring original status and image...');
    
    const { data: restoreData, error: restoreError } = await supabase
      .from('posts')
      .update({ 
        status: originalStatus,
        image: originalImage 
      })
      .eq('id', post.id)
      .select();
    
    if (restoreError) {
      console.log('❌ Restore failed:', restoreError.message);
    } else {
      console.log('✅ Original status and image restored');
      console.log('📊 Restore result:', restoreData);
    }
    
    // Final verification
    console.log('\n🔍 Final verification:');
    const { data: finalData, error: finalError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post.id)
      .single();
    
    if (finalError) {
      console.error('❌ Final verification failed:', finalError);
    } else {
      console.log(`   Title: "${finalData.title}"`);
      console.log(`   Status: ${finalData.status}`);
      console.log(`   Cover Image: "${finalData.image || 'null'}"`);
      console.log(`   Status matches original: ${finalData.status === originalStatus}`);
      console.log(`   Image matches original: ${finalData.image === originalImage}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testCoverUpdatePending();