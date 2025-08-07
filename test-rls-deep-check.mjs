#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSDeepCheck() {
  console.log('🔍 Deep RLS and database check...\n');

  try {
    // 1. Check if we can read data
    console.log('📋 Step 1: Testing read permissions...');
    const { data: readData, error: readError } = await supabase
      .from('posts')
      .select('id, title, image')
      .limit(1);

    if (readError) {
      console.error('❌ Read failed:', readError);
      return;
    } else {
      console.log('✅ Read successful:', readData);
    }

    const post = readData[0];
    console.log(`📋 Testing with post: "${post.title}"`);
    console.log(`📋 Current image: "${post.image}"`);

    // 2. Test different update scenarios
    console.log('\n🔄 Step 2: Testing different update scenarios...');
    
    // Test 2a: Update with error handling
    console.log('\n🔄 Test 2a: Update with detailed error handling...');
    const testImage = `test_rls_deep_${Date.now()}.jpg`;
    
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: testImage })
      .eq('id', post.id)
      .select();

    console.log('📊 Update result:');
    console.log('   Data:', updateData);
    console.log('   Error:', updateError);
    console.log('   Error code:', updateError?.code);
    console.log('   Error message:', updateError?.message);

    // 3. Check if update actually worked
    console.log('\n🔍 Step 3: Checking if update actually worked...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('📋 Post after update:', verifyData);
      console.log('🔄 Image changed?', verifyData.image !== post.image);
      console.log('🔄 Expected:', testImage);
      console.log('🔄 Actual:', verifyData.image);
      
      if (verifyData.image === testImage) {
        console.log('✅ SUCCESS: Update worked!');
      } else {
        console.log('❌ FAILURE: Update did not work');
      }
    }

    // 4. Test if it's a specific field issue
    console.log('\n🔄 Step 4: Testing if it\'s a specific field issue...');
    const testTitle = `Test Title ${Date.now()}`;
    
    const { data: titleUpdateData, error: titleUpdateError } = await supabase
      .from('posts')
      .update({ title: testTitle })
      .eq('id', post.id)
      .select();

    console.log('📊 Title update result:');
    console.log('   Data:', titleUpdateData);
    console.log('   Error:', titleUpdateError);

    // Check title update
    const { data: titleVerifyData, error: titleVerifyError } = await supabase
      .from('posts')
      .select('id, title')
      .eq('id', post.id)
      .single();

    if (titleVerifyError) {
      console.error('❌ Title verification failed:', titleVerifyError);
    } else {
      console.log('📋 Post after title update:', titleVerifyData);
      console.log('🔄 Title changed?', titleVerifyData.title === testTitle);
    }

    // 5. Test if it's a specific post issue
    console.log('\n🔄 Step 5: Testing if it\'s a specific post issue...');
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select('id, title, image')
      .limit(3);

    if (allPostsError) {
      console.error('❌ Failed to get posts:', allPostsError);
    } else {
      console.log(`📋 Found ${allPosts.length} posts to test`);
      
      for (let i = 0; i < Math.min(allPosts.length, 2); i++) {
        const testPost = allPosts[i];
        const testImageForPost = `test_post_${i}_${Date.now()}.jpg`;
        
        console.log(`\n🔄 Testing post ${i + 1}: "${testPost.title}"`);
        
        const { data: postUpdateData, error: postUpdateError } = await supabase
          .from('posts')
          .update({ image: testImageForPost })
          .eq('id', testPost.id)
          .select();

        console.log(`   Update result for post ${i + 1}:`);
        console.log(`   Data:`, postUpdateData);
        console.log(`   Error:`, postUpdateError);
        
        if (postUpdateError) {
          console.log(`   ❌ Post ${i + 1} update failed`);
        } else {
          console.log(`   ✅ Post ${i + 1} update appeared successful`);
        }
      }
    }

    // 6. Check for database triggers or functions
    console.log('\n🔍 Step 6: Checking for potential database issues...');
    console.log('💡 If updates appear successful but data doesn\'t change, possible causes:');
    console.log('   1. RLS policies silently blocking updates');
    console.log('   2. Database triggers overwriting the data');
    console.log('   3. Column-level permissions');
    console.log('   4. Database constraints');
    console.log('   5. Supabase real-time subscriptions interfering');

    // 7. Restore original state
    console.log('\n🔄 Step 7: Restoring original state...');
    await supabase
      .from('posts')
      .update({ 
        image: post.image,
        title: post.title 
      })
      .eq('id', post.id);
    
    console.log('✅ Original state restored');

    // 8. Summary
    console.log('\n📋 SUMMARY:');
    if (verifyData.image === testImage) {
      console.log('✅ UPDATES ARE WORKING!');
      console.log('✅ The issue might be intermittent or specific to certain conditions');
    } else if (titleVerifyData.title === testTitle) {
      console.log('❌ ONLY TITLE UPDATES WORK');
      console.log('❌ IMAGE UPDATES ARE BLOCKED');
      console.log('💡 This suggests a specific issue with the image field');
    } else {
      console.log('❌ NO UPDATES WORK');
      console.log('❌ There is a general database update issue');
      console.log('💡 This is likely an RLS policy issue');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testRLSDeepCheck();