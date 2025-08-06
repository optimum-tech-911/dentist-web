#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkPendingOnly() {
  try {
    console.log('🔍 Checking PENDING articles only (exact admin panel query)...');
    
    // Exact same query as admin panel
    const { data: pendingPosts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching pending posts:', error);
      return;
    }
    
    console.log(`📝 Found ${pendingPosts.length} pending posts`);
    
    if (pendingPosts.length === 0) {
      console.log('❌ No pending posts found');
      return;
    }
    
    console.log('\n⏳ Pending posts:');
    pendingPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Author: ${post.author_email}`);
      console.log(`   Category: ${post.category}`);
      console.log(`   Created: ${post.created_at}`);
      console.log(`   Cover Image: ${post.image || 'No cover image'}`);
      
      if (post.image) {
        if (post.image.startsWith('http')) {
          console.log(`   ✅ Has full URL format`);
        } else {
          console.log(`   ❌ Has file_path format: ${post.image}`);
        }
      }
      
      // Check content length
      const contentLength = post.content ? post.content.length : 0;
      console.log(`   Content Length: ${contentLength} characters`);
      
      // Check for images in content
      if (post.content) {
        const imgMatches = post.content.match(/<img[^>]+src="([^"]*)"[^>]*>/g);
        if (imgMatches) {
          console.log(`   Content Images: ${imgMatches.length} found`);
          imgMatches.forEach((img, imgIndex) => {
            const srcMatch = img.match(/src="([^"]*)"/);
            if (srcMatch) {
              console.log(`     ${imgIndex + 1}. ${srcMatch[1]}`);
            }
          });
        } else {
          console.log(`   Content Images: None found`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking pending posts:', error);
  }
}

// Run the check
checkPendingOnly();