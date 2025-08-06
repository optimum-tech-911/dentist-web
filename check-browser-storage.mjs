#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkBrowserStorage() {
  try {
    console.log('🔍 CHECKING FOR BROWSER STORAGE ISSUES...');
    
    // Check if there are any other tables that might store pending articles
    console.log('\n📋 CHECKING ALL TABLES...');
    
    // Try to get table names (this might not work with anon key)
    try {
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.log('❌ Cannot access table schema (normal for anon key)');
      } else {
        console.log('✅ Available tables:', tables?.map(t => t.table_name));
      }
    } catch (error) {
      console.log('❌ Cannot check table schema');
    }
    
    // Check if there are any posts with different status values
    console.log('\n🔍 CHECKING ALL POSSIBLE STATUS VALUES...');
    const { data: allPosts, error: allPostsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allPostsError) {
      console.error('❌ Error fetching all posts:', allPostsError);
      return;
    }
    
    // Group by status
    const statusCounts = {};
    allPosts.forEach(post => {
      const status = post.status || 'null';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('📊 Status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  "${status}": ${count} articles`);
    });
    
    // Check for any posts that might be "pending" but with different casing
    console.log('\n🔍 CHECKING FOR CASE VARIATIONS...');
    const pendingVariations = ['PENDING', 'Pending', 'pending', 'P', 'p'];
    
    for (const status of pendingVariations) {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', status);
      
      if (!error && posts.length > 0) {
        console.log(`✅ Found ${posts.length} posts with status "${status}":`);
        posts.forEach((post, index) => {
          console.log(`  ${index + 1}. "${post.title}" (${post.id})`);
        });
      }
    }
    
    // Check for any posts with null or empty status
    console.log('\n🔍 CHECKING FOR NULL/EMPTY STATUS...');
    const { data: nullPosts, error: nullError } = await supabase
      .from('posts')
      .select('*')
      .or('status.is.null,status.eq.');
    
    if (!nullError && nullPosts.length > 0) {
      console.log(`✅ Found ${nullPosts.length} posts with null/empty status:`);
      nullPosts.forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}" (${post.id}) - Status: "${post.status}"`);
      });
    }
    
    // Check if there are any other tables that might store posts
    console.log('\n🔍 CHECKING FOR ALTERNATIVE TABLES...');
    const possibleTables = ['drafts', 'articles', 'blog_posts', 'pending_posts', 'submissions'];
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Table "${tableName}" exists and is accessible`);
        }
      } catch (error) {
        // Table doesn't exist or not accessible
      }
    }
    
    console.log('\n✅ BROWSER STORAGE CHECK COMPLETED');
    
  } catch (error) {
    console.error('❌ Error in browser storage check:', error);
  }
}

checkBrowserStorage();