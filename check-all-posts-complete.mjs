#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllPostsComplete() {
  console.log('🔍 Complete check of ALL posts in database...\n');

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
      return;
    }

    // Show all posts with detailed info
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Status: "${post.status}"`);
      console.log(`   Author: ${post.author_email}`);
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

    // Check pending posts specifically
    const pendingPosts = posts.filter(post => post.status === 'pending');
    console.log(`\n📋 Pending posts: ${pendingPosts.length}`);
    if (pendingPosts.length > 0) {
      pendingPosts.forEach((post, index) => {
        console.log(`   ${index + 1}. "${post.title}" (ID: ${post.id})`);
        console.log(`      Cover: "${post.image || 'null'}"`);
      });
    } else {
      console.log('   No pending posts found');
    }

    console.log('\n💡 ANALYSIS:');
    if (posts.length === 4) {
      console.log('✅ Database has 4 posts (matches your admin panel)');
      console.log('✅ The scripts were wrong - there are more posts');
      console.log('💡 The cover image update issue affects ALL posts');
    } else {
      console.log(`⚠️  Database has ${posts.length} posts (you said 4)`);
      console.log('💡 There might be a sync issue');
    }

    if (pendingPosts.length > 0) {
      console.log('\n🎯 NEXT STEP:');
      console.log('   Test cover image updates on these pending posts:');
      pendingPosts.forEach(post => {
        console.log(`   - "${post.title}" (ID: ${post.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllPostsComplete();