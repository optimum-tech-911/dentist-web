#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCurrentPolicy() {
  try {
    console.log('🔍 Testing current policy state...');
    
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
    console.log(`📝 Testing with post: "${post.title}" (ID: ${post.id})`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Current cover: "${post.image || 'null'}"`);
    
    // Test 1: Try to update only the image field
    console.log('\n🔄 Test 1: Update only image field...');
    const testImage1 = 'test-cover-update-1.jpg';
    
    const { data: update1, error: error1 } = await supabase
      .from('posts')
      .update({ image: testImage1 })
      .eq('id', post.id)
      .select();
    
    if (error1) {
      console.error('❌ Update 1 failed:', error1.message);
      console.error('❌ Error code:', error1.code);
    } else {
      console.log('✅ Update 1 appeared successful');
      console.log('📊 Update 1 result:', update1);
    }
    
    // Test 2: Try to update status field
    console.log('\n🔄 Test 2: Update status field...');
    const { data: update2, error: error2 } = await supabase
      .from('posts')
      .update({ status: 'pending' })
      .eq('id', post.id)
      .select();
    
    if (error2) {
      console.error('❌ Update 2 failed:', error2.message);
      console.error('❌ Error code:', error2.code);
    } else {
      console.log('✅ Update 2 appeared successful');
      console.log('📊 Update 2 result:', update2);
    }
    
    // Test 3: Try to update both fields
    console.log('\n🔄 Test 3: Update both status and image...');
    const testImage3 = 'test-cover-update-3.jpg';
    
    const { data: update3, error: error3 } = await supabase
      .from('posts')
      .update({ 
        status: 'approved',
        image: testImage3 
      })
      .eq('id', post.id)
      .select();
    
    if (error3) {
      console.error('❌ Update 3 failed:', error3.message);
      console.error('❌ Error code:', error3.code);
    } else {
      console.log('✅ Update 3 appeared successful');
      console.log('📊 Update 3 result:', update3);
    }
    
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
      
      // Check what actually changed
      console.log('\n🔍 What actually changed:');
      console.log(`   Status changed? ${finalPost.status !== post.status}`);
      console.log(`   Image changed? ${finalPost.image !== post.image}`);
      
      if (finalPost.image === testImage3) {
        console.log('✅ COVER IMAGE UPDATE WORKED!');
      } else {
        console.log('❌ COVER IMAGE UPDATE FAILED - Data not changed');
      }
    }
    
    // Restore original state
    console.log('\n🔄 Restoring original state...');
    await supabase
      .from('posts')
      .update({ 
        status: post.status,
        image: post.image 
      })
      .eq('id', post.id);
    
    console.log('✅ Original state restored');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testCurrentPolicy();