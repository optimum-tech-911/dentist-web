#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEditBlogUpdate() {
  console.log('🔍 Testing EditBlog update process...\n');

  try {
    // Get the post to edit
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
    console.log(`📋 Current cover: "${post.image || 'null'}"`);
    console.log(`📋 Current status: ${post.status}`);

    // Simulate the EXACT EditBlog update process
    const testImage = `editblog_test_${Date.now()}.jpg`;
    
    console.log('🔄 Simulating EditBlog update...');
    console.log('🔄 New cover image:', testImage);
    
    // This is the EXACT update from EditBlog.tsx
    const updateData = {
      title: post.title, // Keep same title
      content: post.content, // Keep same content
      category: post.category, // Keep same category
      image: testImage // Update cover image
    };
    
    console.log('💾 Update data being sent:', updateData);
    
    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', post.id)
      .select();
        
    console.log('📋 Update response:');
    console.log('   Data:', data);
    console.log('   Error:', error);
    console.log('   Error code:', error?.code);
    console.log('   Error message:', error?.message);

    if (error) {
      console.error('❌ Update failed:', error);
      
      if (error.code === '42501') {
        console.log('💡 PERMISSION DENIED - RLS policy blocking update');
      } else if (error.code === '23514') {
        console.log('💡 CHECK CONSTRAINT VIOLATION - Database constraint blocking update');
      } else if (error.code === '23503') {
        console.log('💡 FOREIGN KEY VIOLATION - Foreign key constraint issue');
      }
    } else {
      console.log('✅ Update appeared successful');
    }

    // Check if it actually worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('📋 Verification result:');
      console.log(`   Title: "${verifyData.title}"`);
      console.log(`   Cover: "${verifyData.image || 'null'}"`);
      console.log(`   Status: ${verifyData.status}`);
      console.log(`   Cover changed: ${verifyData.image !== post.image}`);
      
      if (verifyData.image === testImage) {
        console.log('✅ SUCCESS: EditBlog update worked!');
      } else {
        console.log('❌ FAILURE: EditBlog update was blocked');
        console.log('❌ Expected:', testImage);
        console.log('❌ Actual:', verifyData.image);
      }
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

testEditBlogUpdate();