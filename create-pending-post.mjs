#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createPendingPost() {
  try {
    console.log('📝 Creating a pending post for testing...');
    
    // Use the existing author from the posts
    const authorEmail = 'drabdessadok@outlook.com';
    const authorId = '5e451a66-4cc4-47e0-8ef4-c3fa524cbd02';
    
    console.log(`👤 Using existing author: ${authorEmail} (ID: ${authorId})`);
    
    // Create a pending post
    const newPost = {
      title: 'Test Post for Cover Image Update',
      content: 'This is a test post to verify cover image update functionality.',
      category: 'Conseils',
      author_email: authorEmail,
      author_id: authorId,
      status: 'pending',
      image: null // No cover image initially
    };
    
    console.log('📝 Creating post with data:', newPost);
    
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert(newPost)
      .select()
      .single();
    
    if (postError) {
      console.error('❌ Error creating post:', postError);
      return;
    }
    
    console.log('✅ Pending post created successfully!');
    console.log('📊 Post data:', post);
    console.log(`🆔 Post ID: ${post.id}`);
    console.log(`📝 Title: ${post.title}`);
    console.log(`📊 Status: ${post.status}`);
    console.log(`🖼️  Cover Image: ${post.image || 'null'}`);
    
    return post;
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
createPendingPost();