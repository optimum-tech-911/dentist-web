#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUsers() {
  try {
    console.log('👥 Checking users in database...');
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log(`📊 Found ${users?.length || 0} users in users table:`);
    if (users && users.length > 0) {
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (ID: ${user.id}, Role: ${user.role})`);
      });
    } else {
      console.log('   No users found');
    }
    
    // Check auth.users table (if accessible)
    console.log('\n🔐 Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('⚠️  Cannot access auth.users (requires admin privileges)');
      console.log('   Error:', authError.message);
    } else {
      console.log(`📊 Found ${authUsers?.users?.length || 0} auth users:`);
      if (authUsers?.users && authUsers.users.length > 0) {
        authUsers.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
        });
      }
    }
    
    // Check posts to see what authors exist
    console.log('\n📝 Checking posts for existing authors...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('author_email, author_id')
      .limit(10);
    
    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
      return;
    }
    
    console.log(`📊 Found ${posts?.length || 0} posts with authors:`);
    if (posts && posts.length > 0) {
      const uniqueAuthors = new Map();
      posts.forEach(post => {
        if (post.author_email && post.author_id) {
          uniqueAuthors.set(post.author_id, post.author_email);
        }
      });
      
      uniqueAuthors.forEach((email, id) => {
        console.log(`   ${email} (ID: ${id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
checkUsers();