#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllPosts() {
  console.log('🔍 Checking ALL posts in database...\n');

  try {
    // Get ALL posts
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching posts:', fetchError);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('📋 No posts found in database');
      return;
    }

    console.log(`📋 Found ${posts.length} total posts:\n`);

    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Author: ${post.author_email}`);
      console.log(`   Cover: "${post.image || 'null'}"`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Created: ${new Date(post.created_at).toLocaleDateString()}`);
      console.log(`   Updated: ${new Date(post.updated_at).toLocaleDateString()}`);
      console.log('');
    });

    // Check pending posts specifically
    const pendingPosts = posts.filter(post => post.status === 'pending');
    console.log(`📋 Pending posts: ${pendingPosts.length}`);
    if (pendingPosts.length > 0) {
      pendingPosts.forEach((post, index) => {
        console.log(`   ${index + 1}. "${post.title}" (ID: ${post.id})`);
      });
    } else {
      console.log('   No pending posts found');
    }

    console.log('\n📊 SUMMARY:');
    console.log(`   Total posts: ${posts.length}`);
    console.log(`   Pending: ${pendingPosts.length}`);
    console.log(`   Approved: ${posts.filter(p => p.status === 'approved').length}`);
    console.log(`   Rejected: ${posts.filter(p => p.status === 'rejected').length}`);

    if (pendingPosts.length === 0) {
      console.log('\n💡 ISSUE IDENTIFIED:');
      console.log('   You have NO pending posts in the database');
      console.log('   The "pending post" you see in your UI is likely:');
      console.log('   1. Stale cached data');
      console.log('   2. A ghost post that doesn\'t exist');
      console.log('   3. Browser cache showing old data');
      console.log('');
      console.log('🔧 SOLUTION:');
      console.log('   1. Clear your browser cache');
      console.log('   2. Refresh the admin panel');
      console.log('   3. Create a new pending post to test');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllPosts();