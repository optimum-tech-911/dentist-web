#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPendingPosts() {
  console.log('🔍 Checking what pending posts actually exist...\n');

  try {
    // 1. Check all posts by status
    console.log('📋 Step 1: Checking all posts by status...');
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select('id, title, status, author_email, created_at')
      .order('created_at', { ascending: false });

    if (allPostsError) {
      console.error('❌ Error fetching posts:', allPostsError);
      return;
    }

    console.log(`📋 Found ${allPosts.length} total posts:`);
    allPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}"`);
      console.log(`      ID: ${post.id}`);
      console.log(`      Status: ${post.status}`);
      console.log(`      Author: ${post.author_email}`);
      console.log(`      Created: ${new Date(post.created_at).toLocaleDateString()}`);
      console.log('');
    });

    // 2. Check pending posts specifically (same as PendingPosts.tsx)
    console.log('🔍 Step 2: Checking pending posts (same as PendingPosts.tsx)...');
    const { data: pendingPosts, error: pendingError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('❌ Error fetching pending posts:', pendingError);
    } else {
      console.log(`📋 Found ${pendingPosts.length} pending posts:`);
      if (pendingPosts.length === 0) {
        console.log('   No pending posts found');
      } else {
        pendingPosts.forEach((post, index) => {
          console.log(`   ${index + 1}. "${post.title}"`);
          console.log(`      ID: ${post.id}`);
          console.log(`      Author: ${post.author_email}`);
          console.log(`      Cover: "${post.image || 'null'}"`);
          console.log(`      Created: ${new Date(post.created_at).toLocaleDateString()}`);
        });
      }
    }

    // 3. Check for posts with similar titles
    console.log('\n🔍 Step 3: Checking for posts with similar titles...');
    const similarTitles = allPosts.filter(post => 
      post.title.toLowerCase().includes('prévention') || 
      post.title.toLowerCase().includes('caries') ||
      post.title.toLowerCase().includes('mission')
    );

    console.log(`📋 Found ${similarTitles.length} posts with similar titles:`);
    similarTitles.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}"`);
      console.log(`      ID: ${post.id}`);
      console.log(`      Status: ${post.status}`);
      console.log(`      Author: ${post.author_email}`);
    });

    // 4. Check for posts by the same author
    console.log('\n🔍 Step 4: Checking posts by author...');
    const authorGroups = {};
    allPosts.forEach(post => {
      if (!authorGroups[post.author_email]) {
        authorGroups[post.author_email] = [];
      }
      authorGroups[post.author_email].push(post);
    });

    Object.entries(authorGroups).forEach(([email, posts]) => {
      console.log(`📋 Author ${email} has ${posts.length} posts:`);
      posts.forEach(post => {
        console.log(`   - "${post.title}" (${post.status}) - ID: ${post.id}`);
      });
    });

    // 5. Summary
    console.log('\n📋 SUMMARY:');
    console.log(`✅ Total posts: ${allPosts.length}`);
    console.log(`✅ Pending posts: ${pendingPosts.length}`);
    console.log(`✅ Similar titles: ${similarTitles.length}`);
    
    if (pendingPosts.length === 0) {
      console.log('⚠️  NO PENDING POSTS FOUND');
      console.log('💡 This means the "Prévention des caries" post might not exist');
      console.log('💡 Or it might have a different status');
    } else {
      console.log('✅ Pending posts found');
      console.log('💡 Check if "Prévention des caries" is in the list above');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkPendingPosts();