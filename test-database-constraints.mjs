#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConstraints() {
  console.log('🔍 Testing for database constraints and triggers...\n');

  try {
    // 1. Get a post to test with
    console.log('📋 Step 1: Getting a post to test with...');
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, status, updated_at')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with post: "${post.title}"`);
    console.log(`📋 Current cover: "${post.image || 'null'}"`);
    console.log(`📋 Last updated: ${post.updated_at}`);

    // 2. Test different types of updates to isolate the issue
    console.log('\n🔄 Step 2: Testing different update scenarios...');
    
    // Test 2a: Update only the image field
    console.log('\n🔄 Test 2a: Update only image field...');
    const newImagePath = `test_constraint_${Date.now()}.jpg`;
    
    const { data: updateImageData, error: updateImageError } = await supabase
      .from('posts')
      .update({ image: newImagePath })
      .eq('id', post.id)
      .select();

    if (updateImageError) {
      console.error('❌ Image update failed:', updateImageError);
    } else {
      console.log('✅ Image update appeared successful');
      console.log('✅ Returned data:', updateImageData);
    }

    // Test 2b: Update only the title field
    console.log('\n🔄 Test 2b: Update only title field...');
    const newTitle = `Test Title ${Date.now()}`;
    
    const { data: updateTitleData, error: updateTitleError } = await supabase
      .from('posts')
      .update({ title: newTitle })
      .eq('id', post.id)
      .select();

    if (updateTitleError) {
      console.error('❌ Title update failed:', updateTitleError);
    } else {
      console.log('✅ Title update appeared successful');
      console.log('✅ Returned data:', updateTitleData);
    }

    // Test 2c: Update both image and title
    console.log('\n🔄 Test 2c: Update both image and title...');
    const newImagePath2 = `test_constraint_both_${Date.now()}.jpg`;
    const newTitle2 = `Test Title Both ${Date.now()}`;
    
    const { data: updateBothData, error: updateBothError } = await supabase
      .from('posts')
      .update({ 
        image: newImagePath2,
        title: newTitle2 
      })
      .eq('id', post.id)
      .select();

    if (updateBothError) {
      console.error('❌ Both update failed:', updateBothError);
    } else {
      console.log('✅ Both update appeared successful');
      console.log('✅ Returned data:', updateBothData);
    }

    // 3. Check what actually changed
    console.log('\n🔍 Step 3: Checking what actually changed...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image, status, updated_at')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('📋 Post after all update attempts:', verifyData);
      console.log('🔄 Title changed?', verifyData.title !== post.title);
      console.log('🔄 Image changed?', verifyData.image !== post.image);
      console.log('🔄 Updated_at changed?', verifyData.updated_at !== post.updated_at);
      
      console.log('\n📊 Update Results:');
      console.log(`   Title: "${post.title}" → "${verifyData.title}"`);
      console.log(`   Image: "${post.image}" → "${verifyData.image}"`);
      console.log(`   Updated: ${post.updated_at} → ${verifyData.updated_at}`);
      
      if (verifyData.image === newImagePath2) {
        console.log('✅ SUCCESS: Image update worked!');
      } else {
        console.log('❌ FAILURE: Image update did not work');
      }
      
      if (verifyData.title === newTitle2) {
        console.log('✅ SUCCESS: Title update worked!');
      } else {
        console.log('❌ FAILURE: Title update did not work');
      }
    }

    // 4. Restore original state
    console.log('\n🔄 Step 4: Restoring original state...');
    await supabase
      .from('posts')
      .update({ 
        title: post.title,
        image: post.image 
      })
      .eq('id', post.id);
    
    console.log('✅ Original state restored');

    // 5. Summary
    console.log('\n📋 SUMMARY:');
    if (verifyData.image === newImagePath2 && verifyData.title === newTitle2) {
      console.log('✅ ALL UPDATES WORKED!');
      console.log('✅ The issue might be intermittent or specific to certain conditions');
    } else if (verifyData.title === newTitle2 && verifyData.image !== newImagePath2) {
      console.log('❌ ONLY TITLE UPDATES WORK');
      console.log('❌ IMAGE UPDATES ARE BLOCKED');
      console.log('💡 This suggests a specific issue with the image field');
    } else if (verifyData.image === newImagePath2 && verifyData.title !== newTitle2) {
      console.log('❌ ONLY IMAGE UPDATES WORK');
      console.log('❌ TITLE UPDATES ARE BLOCKED');
      console.log('💡 This suggests a specific issue with the title field');
    } else {
      console.log('❌ NO UPDATES WORK');
      console.log('❌ There is a general database update issue');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseConstraints();