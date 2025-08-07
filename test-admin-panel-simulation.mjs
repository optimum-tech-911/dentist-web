#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminPanelSimulation() {
  console.log('🔍 Simulating admin panel cover image update...\n');

  try {
    // 1. Get a post to test with
    console.log('📋 Step 1: Getting a post to test with...');
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, content, status')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with post: "${post.title}"`);
    console.log(`📋 Current cover: "${post.image || 'null'}"`);
    console.log(`📋 Status: ${post.status}`);

    // 2. Simulate the exact PendingPosts.tsx handleCoverImageSelect function
    console.log('\n🔄 Step 2: Simulating PendingPosts.tsx handleCoverImageSelect...');
    const newCoverImage = `admin_panel_test_${Date.now()}.jpg`;
    
    console.log('🔄 This simulates what happens when you select a cover image in admin panel');
    console.log('🔄 New cover image path:', newCoverImage);
    
    // This is the EXACT same code as in PendingPosts.tsx
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: newCoverImage })
      .eq('id', post.id)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('❌ Error details:', updateError);
    } else {
      console.log('✅ Update appeared successful');
      console.log('✅ Returned data:', updateData);
    }

    // 3. Check if the update worked
    console.log('\n🔍 Step 3: Checking if update worked...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image, content, status')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('📋 Post after update:', verifyData);
      console.log('🔄 Cover image changed?', verifyData.image !== post.image);
      console.log('🔄 Expected:', newCoverImage);
      console.log('🔄 Actual:', verifyData.image);
      
      if (verifyData.image === newCoverImage) {
        console.log('✅ SUCCESS: Cover image was updated correctly!');
      } else {
        console.log('❌ FAILURE: Cover image was not updated');
      }
    }

    // 4. Simulate what happens after the update (like refresh or navigation)
    console.log('\n🔄 Step 4: Simulating post-update actions...');
    
    // Simulate fetchPendingPosts() being called
    console.log('🔄 Simulating fetchPendingPosts() call...');
    const { data: refreshData, error: refreshError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', post.status)
      .order('created_at', { ascending: false });

    if (refreshError) {
      console.error('❌ Refresh failed:', refreshError);
    } else {
      const refreshedPost = refreshData.find(p => p.id === post.id);
      if (refreshedPost) {
        console.log('📋 Post after refresh:', refreshedPost);
        console.log('🔄 Cover image after refresh:', refreshedPost.image);
        console.log('🔄 Cover image still correct after refresh?', refreshedPost.image === newCoverImage);
      }
    }

    // 5. Check if there are any database triggers or functions that might interfere
    console.log('\n🔍 Step 5: Checking for interference...');
    console.log('💡 Possible causes if update doesn\'t persist:');
    console.log('   1. Database triggers overwriting the data');
    console.log('   2. Real-time subscriptions interfering');
    console.log('   3. Caching issues');
    console.log('   4. Content processing overwriting the image');
    console.log('   5. Multiple update calls conflicting');

    // 6. Test if it's a timing issue
    console.log('\n🔄 Step 6: Testing for timing issues...');
    console.log('🔄 Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: delayedData, error: delayedError } = await supabase
      .from('posts')
      .select('id, title, image')
      .eq('id', post.id)
      .single();

    if (delayedError) {
      console.error('❌ Delayed check failed:', delayedError);
    } else {
      console.log('📋 Post after 2 second delay:', delayedData);
      console.log('🔄 Cover image after delay:', delayedData.image);
      console.log('🔄 Cover image still correct after delay?', delayedData.image === newCoverImage);
    }

    // 7. Restore original state
    console.log('\n🔄 Step 7: Restoring original state...');
    await supabase
      .from('posts')
      .update({ image: post.image })
      .eq('id', post.id);
    
    console.log('✅ Original state restored');

    // 8. Summary
    console.log('\n📋 SUMMARY:');
    if (verifyData.image === newCoverImage) {
      console.log('✅ COVER IMAGE UPDATE WORKED!');
      console.log('✅ The issue might be in the UI or specific conditions');
    } else {
      console.log('❌ COVER IMAGE UPDATE FAILED');
      console.log('❌ This confirms the issue you described');
      console.log('💡 The problem is likely:');
      console.log('   - Database triggers overwriting the data');
      console.log('   - Real-time subscriptions interfering');
      console.log('   - Content processing logic interfering');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAdminPanelSimulation();