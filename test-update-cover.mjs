#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUpdateCover() {
  try {
    console.log('🧪 Testing cover image update...');
    
    // First, let's check what posts exist and their status
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select('*');
    
    if (allPostsError) {
      console.error('❌ Error fetching posts:', allPostsError);
      return;
    }
    
    console.log('📋 All posts:');
    allPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" (ID: ${post.id}) - Status: ${post.status} - Cover: "${post.image || 'null'}"`);
    });
    
    // Get a pending post (or create one if none exists)
    let { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending')
      .limit(1);
    
    if (postsError || !posts || posts.length === 0) {
      console.log('📝 No pending posts found, trying to get any post...');
      const { data: anyPosts, error: anyPostsError } = await supabase
        .from('posts')
        .select('*')
        .limit(1);
      
      if (anyPostsError || !anyPosts || anyPosts.length === 0) {
        console.error('❌ No posts found at all');
        return;
      }
      
      posts = anyPosts;
      console.log('⚠️  Using non-pending post for testing...');
    }
    
    if (postsError || !posts || posts.length === 0) {
      console.error('❌ No posts found');
      return;
    }
    
    const post = posts[0];
    console.log(`📝 Found post: "${post.title}" (ID: ${post.id})`);
    console.log(`   Current cover: "${post.image || 'null'}"`);
    
    // Update with a specific cover image
    const coverImagePath = 'd25e495d-e4ad-4280-8567-ebcd49e023fa/1754301474577-xmkicuy8e7.png';
    
    console.log(`🖼️  Updating with cover image: ${coverImagePath}`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: coverImagePath })
      .eq('id', post.id)
      .select();
    
    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }
    
    console.log('✅ Update successful!');
    console.log('📊 Updated post data:', updateData);
    
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
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testUpdateCover();