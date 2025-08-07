#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraints() {
  console.log('🔍 Checking database constraints...\n');

  try {
    // Get a post to test with
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with: "${post.title}"`);
    console.log(`📋 Full post data:`, JSON.stringify(post, null, 2));

    // Test 1: Try to update with explicit values
    console.log('\n🔄 Test 1: Update with explicit values...');
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ 
        title: 'Test Title Update',
        content: post.content, // Keep same content
        image: 'test-image-update.jpg',
        category: post.category, // Keep same category
        status: post.status, // Keep same status
        author_email: post.author_email, // Keep same email
        author_id: post.author_id // Keep same author
      })
      .eq('id', post.id)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('❌ Error code:', updateError.code);
      console.error('❌ Error message:', updateError.message);
      console.error('❌ Error details:', updateError.details);
    } else {
      console.log('✅ Update appeared successful');
      console.log('📋 Update response:', updateData);
    }

    // Check if it worked
    console.log('\n🔍 Checking if update worked...');
    const { data: checkData, error: checkError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post.id)
      .single();

    if (checkError) {
      console.error('❌ Check failed:', checkError);
    } else {
      console.log('📋 Post after update:');
      console.log(`   Title: "${checkData.title}" (was: "${post.title}")`);
      console.log(`   Image: "${checkData.image}" (was: "${post.image}")`);
      console.log(`   Status: ${checkData.status} (was: ${post.status})`);
      
      console.log('\n📊 Analysis:');
      console.log(`   Title changed: ${checkData.title !== post.title}`);
      console.log(`   Image changed: ${checkData.image !== post.image}`);
      console.log(`   Status changed: ${checkData.status !== post.status}`);
      
      if (checkData.title === post.title && checkData.image === post.image) {
        console.log('\n💡 UPDATES ARE STILL BEING BLOCKED');
        console.log('💡 This suggests:');
        console.log('   1. Row-level security policies are blocking updates');
        console.log('   2. Database constraints are preventing changes');
        console.log('   3. Application-level code is reverting changes');
        console.log('');
        console.log('🔧 NEXT STEP: Check RLS policies in Supabase Dashboard');
        console.log('   Go to: https://supabase.com/dashboard/project/cmcfeiskfdbsefzqywbk/auth/policies');
        console.log('   Look for policies on the "posts" table');
      } else {
        console.log('\n✅ Updates work!');
      }
    }

    // Restore original
    await supabase
      .from('posts')
      .update({ 
        title: post.title,
        image: post.image,
        status: post.status
      })
      .eq('id', post.id);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkConstraints();