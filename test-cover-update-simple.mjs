#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCoverUpdateSimple() {
  try {
    console.log('🧪 Testing simple cover image update...');
    
    // Get the first post
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError || !posts || posts.length === 0) {
      console.error('❌ No posts found');
      return;
    }
    
    const post = posts[0];
    console.log(`📝 Found post: "${post.title}" (ID: ${post.id})`);
    console.log(`   Current cover: "${post.image || 'null'}"`);
    
    // Test with a simple cover image path
    const testCoverImage = 'test-cover-image.jpg';
    
    console.log(`🖼️  Updating with cover image: ${testCoverImage}`);
    
    // Simulate the exact update that EditBlog does
    const updateData = {
      title: post.title,
      content: post.content,
      category: post.category,
      image: testCoverImage  // This is what EditBlog sends
    };
    
    console.log('💾 Update data:', updateData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', post.id)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('❌ Error code:', updateError.code);
      console.error('❌ Error message:', updateError.message);
      return;
    }
    
    console.log('✅ Update successful!');
    console.log('📊 Update result:', updateResult);
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }
    
    console.log('🔍 Verification:');
    console.log(`   Title: "${verifyData.title}"`);
    console.log(`   Cover Image: "${verifyData.image || 'null'}"`);
    console.log(`   Status: ${verifyData.status}`);
    console.log(`   Cover image updated? ${verifyData.image === testCoverImage}`);
    
    // Restore original image
    console.log('\n🔄 Restoring original image...');
    const restoreData = {
      title: post.title,
      content: post.content,
      category: post.category,
      image: post.image
    };
    
    const { error: restoreError } = await supabase
      .from('posts')
      .update(restoreData)
      .eq('id', post.id);
    
    if (restoreError) {
      console.error('❌ Restore failed:', restoreError);
    } else {
      console.log('✅ Original image restored');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testCoverUpdateSimple();