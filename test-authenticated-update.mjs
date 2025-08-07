#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthenticatedUpdate() {
  console.log('🔍 Testing authenticated user update...\n');

  try {
    // 1. Check current session
    console.log('📋 Step 1: Checking current session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else {
      console.log('📋 Session data:', sessionData);
      console.log('📋 User authenticated:', !!sessionData.session);
      console.log('📋 User ID:', sessionData.session?.user?.id);
      console.log('📋 User email:', sessionData.session?.user?.email);
    }

    // 2. Try to get user role
    console.log('\n📋 Step 2: Checking user role...');
    if (sessionData.session?.user?.id) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', sessionData.session.user.id)
        .single();

      if (userError) {
        console.error('❌ User role error:', userError);
      } else {
        console.log('📋 User role:', userData.role);
      }
    } else {
      console.log('⚠️  No authenticated user - using anonymous key');
    }

    // 3. Test update with current credentials
    console.log('\n🔄 Step 3: Testing update with current credentials...');
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with post: "${post.title}"`);
    console.log(`📋 Current cover: "${post.image || 'null'}"`);

    const testImage = `auth_test_${Date.now()}.jpg`;
    
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

    // 4. Check if update worked
    console.log('\n🔍 Step 4: Checking if update worked...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('📋 Post after update:', verifyData);
      console.log('🔄 Cover image changed?', verifyData.image !== post.image);
      console.log('🔄 Expected:', testImage);
      console.log('🔄 Actual:', verifyData.image);
      
      if (verifyData.image === testImage) {
        console.log('✅ SUCCESS: Update worked!');
      } else {
        console.log('❌ FAILURE: Update did not work');
      }
    }

    // 5. Restore original state
    console.log('\n🔄 Step 5: Restoring original state...');
    await supabase
      .from('posts')
      .update({ image: post.image })
      .eq('id', post.id);
    
    console.log('✅ Original state restored');

    // 6. Summary and recommendations
    console.log('\n📋 SUMMARY:');
    if (verifyData.image === testImage) {
      console.log('✅ UPDATES WORK WITH CURRENT CREDENTIALS!');
      console.log('✅ The issue might be intermittent or specific to certain conditions');
    } else {
      console.log('❌ UPDATES DO NOT WORK WITH CURRENT CREDENTIALS');
      console.log('❌ This suggests an authentication or permission issue');
    }

    console.log('\n💡 RECOMMENDATIONS:');
    if (!sessionData.session) {
      console.log('   1. You need to be logged in to update posts');
      console.log('   2. The admin panel should use authenticated user credentials');
      console.log('   3. Make sure you\'re logged in as an admin/doctor user');
    } else {
      console.log('   1. You are logged in, but updates still don\'t work');
      console.log('   2. Check if your user has the right role (admin/doctor)');
      console.log('   3. Check if there are any RLS policy issues');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAuthenticatedUpdate();