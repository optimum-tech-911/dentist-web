#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAllPostsRaw() {
  try {
    console.log('🔍 Checking ALL posts in database (raw query)...');
    
    // Get ALL posts without any filtering
    const { data: allPosts, error } = await supabase
      .from('posts')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    console.log(`📝 Found ${allPosts.length} total posts in database`);
    
    if (allPosts.length === 0) {
      console.log('❌ No posts found at all');
      return;
    }
    
    console.log('\n📋 ALL POSTS (raw data):');
    allPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Status: "${post.status}"`);
      console.log(`   Author: ${post.author_email}`);
      console.log(`   Cover Image: "${post.image || 'null'}"`);
      console.log(`   Created: ${post.created_at}`);
      console.log(`   Content length: ${post.content?.length || 0} chars`);
    });
    
    // Check for any posts with 'pending' status (case insensitive)
    const pendingPosts = allPosts.filter(post => 
      post.status && post.status.toLowerCase() === 'pending'
    );
    
    console.log(`\n⏳ Posts with 'pending' status: ${pendingPosts.length}`);
    pendingPosts.forEach((post, index) => {
      console.log(`  ${index + 1}. "${post.title}"`);
      console.log(`     Cover: "${post.image || 'null'}"`);
    });
    
    // Check for any posts with 'approved' status
    const approvedPosts = allPosts.filter(post => 
      post.status && post.status.toLowerCase() === 'approved'
    );
    
    console.log(`\n✅ Posts with 'approved' status: ${approvedPosts.length}`);
    approvedPosts.forEach((post, index) => {
      console.log(`  ${index + 1}. "${post.title}"`);
      console.log(`     Cover: "${post.image || 'null'}"`);
    });
    
  } catch (error) {
    console.error('❌ Error checking posts:', error);
  }
}

// Run the check
checkAllPostsRaw();