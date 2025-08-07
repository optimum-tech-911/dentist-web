#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPendingQuery() {
  console.log('🔍 Testing the exact PendingPosts query...\n');

  try {
    // This is the EXACT query from PendingPosts.tsx
    console.log('📋 Running: .from("posts").select("*").eq("status", "pending")');
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log(`📋 Query returned ${data?.length || 0} posts:\n`);

    if (!data || data.length === 0) {
      console.log('❌ NO PENDING POSTS FOUND');
      console.log('💡 Your admin panel is showing cached data');
      return;
    }

    data.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Status: "${post.status}"`);
      console.log(`   Author: ${post.author_email}`);
      console.log(`   Cover: "${post.image || 'null'}"`);
      console.log(`   Created: ${new Date(post.created_at).toLocaleString()}`);
      console.log('');
    });

    // Also test without the status filter to see ALL posts
    console.log('🔍 Testing without status filter (all posts):');
    const { data: allData, error: allError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ All posts query error:', allError);
    } else {
      console.log(`📋 All posts query returned ${allData?.length || 0} posts:`);
      allData?.forEach((post, index) => {
        console.log(`   ${index + 1}. "${post.title}" - Status: "${post.status}"`);
      });
    }

    console.log('\n💡 ANALYSIS:');
    if (data.length === 0 && allData?.length === 1) {
      console.log('   Database has 1 post (approved)');
      console.log('   Pending query returns 0 posts');
      console.log('   Your admin panel showing 3 posts = CACHE ISSUE');
      console.log('');
      console.log('🔧 SOLUTION:');
      console.log('   1. Hard refresh admin panel (Ctrl+F5)');
      console.log('   2. Clear browser cache');
      console.log('   3. Check browser dev tools for cached requests');
      console.log('   4. Restart your development server');
    } else if (data.length > 0) {
      console.log('   Pending posts found in database');
      console.log('   Check the IDs above');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPendingQuery();