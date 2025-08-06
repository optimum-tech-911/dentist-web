#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkPendingOnly() {
  try {
    console.log('🔍 CHECKING PENDING ARTICLES ONLY...');
    
    // Check ALL posts by status
    console.log('\n📝 ALL POSTS BY STATUS:');
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allPostsError) {
      console.error('❌ Error fetching all posts:', allPostsError);
      return;
    }
    
    console.log(`✅ Total posts found: ${allPosts.length}`);
    
    // Group by status
    const byStatus = {};
    allPosts.forEach(post => {
      const status = post.status || 'unknown';
      if (!byStatus[status]) byStatus[status] = [];
      byStatus[status].push(post);
    });
    
    Object.keys(byStatus).forEach(status => {
      console.log(`\n📊 Status "${status}": ${byStatus[status].length} articles`);
      byStatus[status].forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}"`);
        console.log(`     ID: ${post.id}`);
        console.log(`     Author: ${post.author_email}`);
        console.log(`     Cover Image: "${post.image || 'null'}"`);
        console.log(`     Created: ${post.created_at}`);
      });
    });
    
    // Check specifically for pending
    console.log('\n⏳ SPECIFICALLY CHECKING PENDING STATUS:');
    const { data: pendingPosts, error: pendingError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending');
    
    if (pendingError) {
      console.error('❌ Error fetching pending posts:', pendingError);
    } else {
      console.log(`✅ Pending posts found: ${pendingPosts.length}`);
      pendingPosts.forEach((post, index) => {
        console.log(`\n${index + 1}. "${post.title}"`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Author: ${post.author_email}`);
        console.log(`   Cover Image: "${post.image || 'null'}"`);
        console.log(`   Created: ${post.created_at}`);
        console.log(`   Content preview: ${post.content?.substring(0, 100)}...`);
      });
    }
    
    // Check for any posts with null status
    console.log('\n❓ CHECKING POSTS WITH NULL STATUS:');
    const { data: nullStatusPosts, error: nullError } = await supabase
      .from('posts')
      .select('*')
      .is('status', null);
    
    if (nullError) {
      console.error('❌ Error fetching null status posts:', nullError);
    } else {
      console.log(`✅ Null status posts found: ${nullStatusPosts.length}`);
      nullStatusPosts.forEach((post, index) => {
        console.log(`\n${index + 1}. "${post.title}"`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Author: ${post.author_email}`);
        console.log(`   Cover Image: "${post.image || 'null'}"`);
        console.log(`   Created: ${post.created_at}`);
      });
    }
    
    // Check for any posts with empty string status
    console.log('\n❓ CHECKING POSTS WITH EMPTY STATUS:');
    const { data: emptyStatusPosts, error: emptyError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', '');
    
    if (emptyError) {
      console.error('❌ Error fetching empty status posts:', emptyError);
    } else {
      console.log(`✅ Empty status posts found: ${emptyStatusPosts.length}`);
      emptyStatusPosts.forEach((post, index) => {
        console.log(`\n${index + 1}. "${post.title}"`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Author: ${post.author_email}`);
        console.log(`   Cover Image: "${post.image || 'null'}"`);
        console.log(`   Created: ${post.created_at}`);
      });
    }
    
    console.log('\n✅ PENDING CHECK COMPLETED');
    
  } catch (error) {
    console.error('❌ Error in pending check:', error);
  }
}

// Run the pending check
checkPendingOnly();