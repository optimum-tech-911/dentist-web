#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseUpdateCheck() {
  console.log('🔍 Testing if database update is actually working...\n');

  try {
    // 1. Get a post to test with
    console.log('📋 Step 1: Getting a post to test with...');
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with post: "${post.title}"`);
    console.log(`📋 Status: ${post.status}`);
    console.log(`📋 Current cover: "${post.image || 'null'}"`);

    // 2. Test the exact same update as PendingPosts.tsx
    console.log('\n🔄 Step 2: Testing database update (same as PendingPosts.tsx)...');
    const newImagePath = `test_db_update_${Date.now()}.jpg`;
    
    console.log('🔄 This simulates handleCoverImageSelect in PendingPosts.tsx');
    console.log('🔄 New image path:', newImagePath);
    
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

    // 3. Check if it actually worked (same as fetchPendingPosts would do)
    console.log('\n🔍 Step 3: Checking if update actually worked...');
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
        console.log('✅ SUCCESS: Database update actually worked!');
        console.log('✅ The issue is NOT with the database update');
        console.log('💡 The problem might be in the UI refresh logic');
      } else {
        console.log('❌ FAILURE: Database update did NOT work');
        console.log('❌ Expected:', newImagePath);
        console.log('❌ Actual:', verifyData.image);
        console.log('💡 This confirms there IS a database-level issue');
      }
    }

    // 4. Test the fetchPendingPosts logic specifically
    console.log('\n🔄 Step 4: Testing fetchPendingPosts logic...');
    const { data: fetchData, error: fetchPendingError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', post.status) // Use the same status as the test post
      .order('created_at', { ascending: false });

    if (fetchPendingError) {
      console.error('❌ Fetch pending posts failed:', fetchPendingError);
    } else {
      console.log(`📋 Fetched ${fetchPendingError ? 0 : fetchData?.length || 0} posts with status '${post.status}'`);
      
      // Find our test post in the fetched data
      const fetchedPost = fetchData?.find(p => p.id === post.id);
      if (fetchedPost) {
        console.log('📋 Our test post in fetched data:', fetchedPost);
        console.log('🔄 Image in fetched data:', fetchedPost.image);
        console.log('🔄 Expected image:', newImagePath);
        console.log('🔄 Match?', fetchedPost.image === newImagePath);
        
        if (fetchedPost.image === newImagePath) {
          console.log('✅ SUCCESS: fetchPendingPosts would see the updated image!');
          console.log('✅ The database update is working correctly');
          console.log('💡 The issue must be in the React component logic');
        } else {
          console.log('❌ FAILURE: fetchPendingPosts would NOT see the updated image');
          console.log('❌ This means the database update is not working');
        }
      } else {
        console.log('⚠️  Our test post not found in fetched data');
      }
    }

    // 5. Restore original
    console.log('\n🔄 Step 5: Restoring original state...');
    await supabase
      .from('posts')
      .update({ image: post.image })
      .eq('id', post.id);
    
    console.log('✅ Original state restored');

    // 6. Summary
    console.log('\n📋 SUMMARY:');
    if (verifyData.image === newImagePath) {
      console.log('✅ DATABASE UPDATE IS WORKING!');
      console.log('✅ The issue is in the React component logic');
      console.log('💡 Check the PendingPosts.tsx component for UI refresh issues');
    } else {
      console.log('❌ DATABASE UPDATE IS NOT WORKING');
      console.log('❌ There is a database-level issue (RLS, permissions, etc.)');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseUpdateCheck();