#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPostsIds() {
  console.log('🔍 Checking all posts and their IDs...\n');

  try {
    // 1. Get all posts
    console.log('📋 Step 1: Getting all posts...');
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select('id, title, image, status, author_email')
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
      console.log(`      Cover: "${post.image || 'null'}"`);
      console.log('');
    });

    // 2. Check for the specific posts mentioned
    console.log('🔍 Step 2: Looking for specific posts...');
    
    const notreMission = allPosts.find(p => p.title.includes('Notre Mission'));
    const preventionCaries = allPosts.find(p => p.title.includes('Prévention des caries'));
    
    if (notreMission) {
      console.log('📋 "Notre Mission" post:');
      console.log(`   ID: ${notreMission.id}`);
      console.log(`   Title: "${notreMission.title}"`);
      console.log(`   Status: ${notreMission.status}`);
      console.log(`   Cover: "${notreMission.image || 'null'}"`);
    } else {
      console.log('❌ "Notre Mission" post not found');
    }
    
    if (preventionCaries) {
      console.log('📋 "Prévention des caries" post:');
      console.log(`   ID: ${preventionCaries.id}`);
      console.log(`   Title: "${preventionCaries.title}"`);
      console.log(`   Status: ${preventionCaries.status}`);
      console.log(`   Cover: "${preventionCaries.image || 'null'}"`);
    } else {
      console.log('❌ "Prévention des caries" post not found');
    }

    // 3. Check for pending posts specifically
    console.log('\n🔍 Step 3: Checking pending posts...');
    const pendingPosts = allPosts.filter(p => p.status === 'pending');
    
    console.log(`📋 Found ${pendingPosts.length} pending posts:`);
    pendingPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}"`);
      console.log(`      ID: ${post.id}`);
      console.log(`      Author: ${post.author_email}`);
      console.log(`      Cover: "${post.image || 'null'}"`);
    });

    // 4. Check for duplicate titles or similar issues
    console.log('\n🔍 Step 4: Checking for potential issues...');
    const titles = allPosts.map(p => p.title);
    const duplicateTitles = titles.filter((title, index) => titles.indexOf(title) !== index);
    
    if (duplicateTitles.length > 0) {
      console.log('⚠️  Found duplicate titles:', duplicateTitles);
    } else {
      console.log('✅ No duplicate titles found');
    }

    // 5. Check for posts with same author
    console.log('\n🔍 Step 5: Checking posts by author...');
    const authorGroups = {};
    allPosts.forEach(post => {
      if (!authorGroups[post.author_email]) {
        authorGroups[post.author_email] = [];
      }
      authorGroups[post.author_email].push(post);
    });

    Object.entries(authorGroups).forEach(([email, posts]) => {
      if (posts.length > 1) {
        console.log(`📋 Author ${email} has ${posts.length} posts:`);
        posts.forEach(post => {
          console.log(`   - "${post.title}" (ID: ${post.id})`);
        });
      }
    });

    // 6. Summary
    console.log('\n📋 SUMMARY:');
    console.log(`✅ Total posts: ${allPosts.length}`);
    console.log(`✅ Pending posts: ${pendingPosts.length}`);
    console.log(`✅ Authors: ${Object.keys(authorGroups).length}`);
    
    if (notreMission && preventionCaries) {
      console.log('✅ Both posts found');
      console.log('💡 If you updated "Prévention des caries" but "Notre Mission" changed,');
      console.log('💡 there might be a bug in the UI or a race condition');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testPostsIds();