#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPostsDetailed() {
  console.log('🔍 Detailed check of ALL posts...\n');

  try {
    // Get ALL posts with no filters
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching posts:', fetchError);
      return;
    }

    console.log(`📋 Database shows ${posts.length} total posts:\n`);

    if (posts.length === 0) {
      console.log('❌ NO POSTS IN DATABASE');
      console.log('💡 Your admin panel is showing cached/ghost data');
      return;
    }

    // Show all posts with detailed info
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Status: "${post.status}"`);
      console.log(`   Author: ${post.author_email}`);
      console.log(`   Author ID: ${post.author_id}`);
      console.log(`   Cover: "${post.image || 'null'}"`);
      console.log(`   Category: "${post.category}"`);
      console.log(`   Created: ${new Date(post.created_at).toLocaleString()}`);
      console.log(`   Updated: ${new Date(post.updated_at).toLocaleString()}`);
      console.log('');
    });

    // Group by status
    const statusGroups = {};
    posts.forEach(post => {
      const status = post.status || 'null';
      if (!statusGroups[status]) {
        statusGroups[status] = [];
      }
      statusGroups[status].push(post);
    });

    console.log('📊 Posts by status:');
    Object.keys(statusGroups).forEach(status => {
      console.log(`   "${status}": ${statusGroups[status].length} posts`);
      statusGroups[status].forEach(post => {
        console.log(`     - "${post.title}" (ID: ${post.id})`);
      });
    });

    // Check for any posts that might be "pending" but with different case
    const pendingVariants = posts.filter(post => 
      post.status && post.status.toLowerCase().includes('pending')
    );

    if (pendingVariants.length > 0) {
      console.log('\n🔍 Found posts with "pending" in status:');
      pendingVariants.forEach(post => {
        console.log(`   "${post.title}" - Status: "${post.status}"`);
      });
    }

    // Check for posts with null or empty status
    const nullStatus = posts.filter(post => !post.status || post.status === '');
    if (nullStatus.length > 0) {
      console.log('\n🔍 Found posts with null/empty status:');
      nullStatus.forEach(post => {
        console.log(`   "${post.title}" - Status: "${post.status}"`);
      });
    }

    console.log('\n💡 ANALYSIS:');
    if (posts.length === 1 && posts[0].status === 'approved') {
      console.log('   Database has only 1 approved post');
      console.log('   Your admin panel showing 3 pending posts = CACHE ISSUE');
      console.log('');
      console.log('🔧 SOLUTION:');
      console.log('   1. Hard refresh admin panel (Ctrl+F5)');
      console.log('   2. Clear browser cache');
      console.log('   3. Check if you have multiple browser tabs open');
      console.log('   4. Restart your development server');
    } else {
      console.log('   Database has multiple posts with different statuses');
      console.log('   Check the status values above');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPostsDetailed();