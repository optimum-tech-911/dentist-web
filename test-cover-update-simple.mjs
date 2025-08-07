#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCoverUpdateSimple() {
  console.log('🔍 Simple cover image update test...\n');

  try {
    // 1. Get any post to test with
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

    // 2. Test the exact same update that happens in PendingPosts.tsx and EditBlog.tsx
    console.log('\n🔄 Step 2: Testing cover image update...');
    const newImagePath = `test_cover_${Date.now()}.jpg`;
    
    console.log('🔄 This is the EXACT same code used in:');
    console.log('   - PendingPosts.tsx handleCoverImageSelect()');
    console.log('   - EditBlog.tsx handleSubmit()');
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

    // 3. Check if it actually worked
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
        console.log('✅ SUCCESS: Cover image was actually updated!');
        console.log('✅ The RLS policy fix worked!');
      } else {
        console.log('❌ FAILURE: Cover image was NOT updated (silent RLS block)');
        console.log('❌ Expected:', newImagePath);
        console.log('❌ Actual:', verifyData.image);
        console.log('💡 This is why cover image updates fail in the admin panel');
      }
    }

    // 4. Restore original
    console.log('\n🔄 Step 4: Restoring original state...');
    await supabase
      .from('posts')
      .update({ image: post.image })
      .eq('id', post.id);
    
    console.log('✅ Original state restored');

    // 5. Summary
    console.log('\n📋 SUMMARY:');
    if (verifyData.image === newImagePath) {
      console.log('✅ COVER IMAGE UPDATES ARE WORKING!');
      console.log('✅ The RLS policy fix has been applied successfully');
    } else {
      console.log('❌ COVER IMAGE UPDATES ARE STILL BLOCKED');
      console.log('❌ You need to apply the RLS policy fix');
      console.log('\n🔧 TO FIX THIS:');
      console.log('1. Go to: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql');
      console.log('2. Run this SQL:');
      console.log(`
DROP POLICY IF EXISTS "Admins can update post status" ON public.posts;

CREATE POLICY "Admin panel users can update posts" ON public.posts
  FOR UPDATE USING (
    public.get_current_user_role() IN ('admin', 'doctor', 'president', 'secretaire', 'tresorier')
  );
      `);
      console.log('3. Run this test again to verify the fix');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testCoverUpdateSimple();