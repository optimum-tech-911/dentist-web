#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAllStatuses() {
  try {
    console.log('🔍 Checking ALL articles and their statuses...');
    
    // Get all posts regardless of status
    const { data: allPosts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    console.log(`📝 Found ${allPosts.length} total posts`);
    
    if (allPosts.length === 0) {
      console.log('❌ No posts found at all');
      return;
    }
    
    // Group by status
    const byStatus = {};
    allPosts.forEach(post => {
      const status = post.status || 'unknown';
      if (!byStatus[status]) {
        byStatus[status] = [];
      }
      byStatus[status].push(post);
    });
    
    console.log('\n📊 Posts by status:');
    Object.keys(byStatus).forEach(status => {
      console.log(`\n${status.toUpperCase()}: ${byStatus[status].length} posts`);
      byStatus[status].forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}"`);
        console.log(`     ID: ${post.id}`);
        console.log(`     Author: ${post.author_email}`);
        console.log(`     Cover Image: ${post.image || 'No cover image'}`);
        console.log(`     Created: ${post.created_at}`);
      });
    });
    
    // Check if any posts have cover images
    const postsWithImages = allPosts.filter(post => post.image);
    console.log(`\n🖼️  Posts with cover images: ${postsWithImages.length}`);
    postsWithImages.forEach((post, index) => {
      console.log(`  ${index + 1}. "${post.title}" (${post.status})`);
      console.log(`     Cover: ${post.image}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking posts:', error);
  }
}

// Run the check
checkAllStatuses();