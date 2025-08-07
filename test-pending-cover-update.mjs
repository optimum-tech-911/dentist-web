#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPendingCoverUpdate() {
  console.log('🔍 Testing cover image update on pending posts...\n');

  try {
    // 1. Find a pending post
    console.log('📋 Step 1: Finding a pending post...');
    let { data: pendingPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .eq('status', 'pending')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error fetching pending posts:', fetchError);
      return;
    }

    if (!pendingPosts || pendingPosts.length === 0) {
      console.log('⚠️  No pending posts found. Checking for any posts...');
      const { data: anyPosts, error: anyError } = await supabase
        .from('posts')
        .select('id, title, image, status')
        .limit(1);

      if (anyError || !anyPosts || anyPosts.length === 0) {
        console.error('❌ No posts found at all:', anyError);
        return;
      }

      console.log('📋 Found post:', anyPosts[0]);
      pendingPosts = anyPosts;
    }

    const post = pendingPosts[0];
    console.log('📋 Found post:', post);

    // 2. Check current image
    console.log('\n📸 Step 2: Current image state...');
    console.log('Current image:', post.image);
    console.log('Post status:', post.status);

    // 3. Try to update the cover image
    console.log('\n🔄 Step 3: Attempting cover image update...');
    const newImagePath = `test_cover_${Date.now()}.jpg`;
    
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: newImagePath })
      .eq('id', post.id)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('❌ Error details:', updateError);
    } else {
      console.log('✅ Update appeared successful');
      console.log('✅ Returned data:', updateData);
    }

    // 4. Verify if the update actually worked
    console.log('\n🔍 Step 4: Verifying update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('📋 Post after update attempt:', verifyData);
      console.log('🔄 Image changed from:', post.image, 'to:', verifyData.image);
      
      if (verifyData.image === newImagePath) {
        console.log('✅ SUCCESS: Cover image was actually updated!');
      } else {
        console.log('❌ FAILURE: Cover image was NOT updated (silent RLS block)');
        console.log('❌ Expected:', newImagePath);
        console.log('❌ Actual:', verifyData.image);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testPendingCoverUpdate();