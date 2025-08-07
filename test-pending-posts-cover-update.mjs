#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPendingPostsCoverUpdate() {
  console.log('🔍 Testing pending posts cover image update...\n');

  try {
    // 1. Find pending posts specifically
    console.log('📋 Step 1: Finding pending posts...');
    const { data: pendingPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, status, author_email')
      .eq('status', 'pending')
      .limit(3);

    if (fetchError) {
      console.error('❌ Error fetching pending posts:', fetchError);
      return;
    }

    if (!pendingPosts || pendingPosts.length === 0) {
      console.log('⚠️  No pending posts found. Creating a test scenario...');
      console.log('💡 This means you need to create a pending post first');
      console.log('💡 Or test with an existing post by changing its status to pending');
      return;
    }

    console.log(`📋 Found ${pendingPosts.length} pending posts:`);
    pendingPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" (ID: ${post.id})`);
      console.log(`      Author: ${post.author_email}`);
      console.log(`      Current cover: "${post.image || 'null'}"`);
    });

    // 2. Test cover image update on the first pending post
    const testPost = pendingPosts[0];
    console.log(`\n🎯 Testing with pending post: "${testPost.title}"`);
    console.log(`🎯 Post ID: ${testPost.id}`);
    console.log(`🎯 Current cover: "${testPost.image || 'null'}"`);

    // 3. Simulate the PendingPosts.tsx handleCoverImageSelect function
    console.log('\n🔄 Step 2: Simulating handleCoverImageSelect...');
    const newImagePath = `pending_test_cover_${Date.now()}.jpg`;
    
    console.log('🔄 This simulates what happens when you select a cover image in pending posts page');
    console.log('🔄 New image path:', newImagePath);
    
    // This is the exact same code as in PendingPosts.tsx handleCoverImageSelect
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: newImagePath })
      .eq('id', testPost.id)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('❌ Error details:', updateError);
      console.log('💡 This confirms the RLS policy is blocking the update');
    } else {
      console.log('✅ Update appeared successful');
      console.log('✅ Returned data:', updateData);
    }

    // 4. Verify if the update actually worked
    console.log('\n🔍 Step 3: Verifying update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .eq('id', testPost.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('📋 Post after update attempt:', verifyData);
      console.log('🔄 Image changed from:', testPost.image, 'to:', verifyData.image);
      
      if (verifyData.image === newImagePath) {
        console.log('✅ SUCCESS: Cover image was actually updated!');
        console.log('✅ The RLS policy fix worked!');
      } else {
        console.log('❌ FAILURE: Cover image was NOT updated (silent RLS block)');
        console.log('❌ Expected:', newImagePath);
        console.log('❌ Actual:', verifyData.image);
        console.log('💡 This confirms the RLS policy is still blocking updates');
      }
    }

    // 5. Restore original state
    console.log('\n🔄 Step 4: Restoring original state...');
    await supabase
      .from('posts')
      .update({ image: testPost.image })
      .eq('id', testPost.id);
    
    console.log('✅ Original state restored');

    // 6. Summary
    console.log('\n📋 SUMMARY:');
    console.log('✅ Pending posts found:', pendingPosts.length);
    console.log('✅ Test completed successfully');
    console.log('💡 If the update failed, you need to apply the RLS policy fix');
    console.log('💡 If the update succeeded, the fix is working!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testPendingPostsCoverUpdate();