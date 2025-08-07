#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthenticatedUpdate() {
  console.log('🔍 Testing authenticated cover image update...\n');

  try {
    // Get current posts
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, status, author_id')
      .limit(5);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    console.log('📋 Available posts:');
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}"`);
      console.log(`      ID: ${post.id}`);
      console.log(`      Status: ${post.status}`);
      console.log(`      Cover: "${post.image || 'null'}"`);
      console.log(`      Author: ${post.author_id}`);
      console.log('');
    });

    // Test update on first post
    const post = posts[0];
    const testImage = `authenticated_test_${Date.now()}.jpg`;
    
    console.log(`🔄 Testing update on: "${post.title}"`);
    console.log(`🔄 Setting cover to: "${testImage}"`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: testImage })
      .eq('id', post.id)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('❌ Error details:', updateError);
      return;
    }

    console.log('✅ Update appeared successful');
    console.log('📋 Update response:', updateData);

    // Verify the change
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('📋 Post after update:', verifyData);
    console.log('🔄 Cover image changed?', verifyData.image !== post.image);
    
    if (verifyData.image === testImage) {
      console.log('✅ SUCCESS: Cover image update works!');
    } else {
      console.log('❌ FAILURE: Cover image update blocked by RLS');
      console.log('❌ Expected:', testImage);
      console.log('❌ Actual:', verifyData.image);
      console.log('');
      console.log('🔧 SOLUTION: Apply the RLS policy fix');
      console.log('   Go to: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/sql');
      console.log('   Run the SQL from fix-cover-image-permanent.sql');
    }

    // Restore original
    await supabase
      .from('posts')
      .update({ image: post.image })
      .eq('id', post.id);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAuthenticatedUpdate();