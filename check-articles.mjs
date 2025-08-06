#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkArticles() {
  try {
    console.log('🔍 Checking all articles in database...');
    
    // Get all posts
    const { data: allPosts, error } = await supabase
      .from('posts')
      .select('id, title, status, image, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    console.log(`📝 Found ${allPosts.length} total articles`);
    
    // Check pending articles
    const pendingPosts = allPosts.filter(post => post.status === 'pending');
    console.log(`\n⏳ Pending articles (${pendingPosts.length}):`);
    pendingPosts.forEach(post => {
      console.log(`  - "${post.title}" (ID: ${post.id})`);
      console.log(`    Image: ${post.image || 'No image'}`);
      if (post.image) {
        if (post.image.startsWith('http')) {
          console.log(`    ✅ Has full URL format`);
        } else {
          console.log(`    ❌ Has file_path format: ${post.image}`);
        }
      }
    });
    
    // Check approved articles
    const approvedPosts = allPosts.filter(post => post.status === 'approved');
    console.log(`\n✅ Approved articles (${approvedPosts.length}):`);
    approvedPosts.forEach(post => {
      console.log(`  - "${post.title}" (ID: ${post.id})`);
      console.log(`    Image: ${post.image || 'No image'}`);
      if (post.image) {
        if (post.image.startsWith('http')) {
          console.log(`    ✅ Has full URL format`);
        } else {
          console.log(`    ❌ Has file_path format: ${post.image}`);
        }
      }
    });
    
    // Check rejected articles
    const rejectedPosts = allPosts.filter(post => post.status === 'rejected');
    console.log(`\n❌ Rejected articles (${rejectedPosts.length}):`);
    rejectedPosts.forEach(post => {
      console.log(`  - "${post.title}" (ID: ${post.id})`);
      console.log(`    Image: ${post.image || 'No image'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking articles:', error);
  }
}

// Run the check
checkArticles();