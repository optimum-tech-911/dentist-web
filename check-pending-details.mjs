#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkPendingDetails() {
  try {
    console.log('🔍 Checking pending articles with detailed query...');
    
    // Get ALL posts first
    const { data: allPosts, error: allError } = await supabase
      .from('posts')
      .select('*');
    
    if (allError) {
      console.error('❌ Error fetching all posts:', allError);
      return;
    }
    
    console.log(`📝 Total posts in database: ${allPosts.length}`);
    
    // Check each post's status
    allPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. "${post.title}"`);
      console.log(`   Status: ${post.status}`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Author: ${post.author_email}`);
      console.log(`   Cover Image: ${post.image || 'No cover image'}`);
      console.log(`   Created: ${post.created_at}`);
    });
    
    // Filter by status
    const pendingPosts = allPosts.filter(post => post.status === 'pending');
    const approvedPosts = allPosts.filter(post => post.status === 'approved');
    const otherPosts = allPosts.filter(post => !['pending', 'approved'].includes(post.status));
    
    console.log(`\n📊 Status breakdown:`);
    console.log(`   Pending: ${pendingPosts.length}`);
    console.log(`   Approved: ${approvedPosts.length}`);
    console.log(`   Other: ${otherPosts.length}`);
    
    if (pendingPosts.length > 0) {
      console.log('\n⏳ Pending articles:');
      pendingPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}"`);
        console.log(`     Cover: ${post.image || 'No cover image'}`);
        console.log(`     Author: ${post.author_email}`);
      });
    }
    
    if (approvedPosts.length > 0) {
      console.log('\n✅ Approved articles:');
      approvedPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}"`);
        console.log(`     Cover: ${post.image || 'No cover image'}`);
        console.log(`     Author: ${post.author_email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking pending details:', error);
  }
}

// Run the check
checkPendingDetails();