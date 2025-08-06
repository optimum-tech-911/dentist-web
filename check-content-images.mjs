#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkContentImages() {
  try {
    console.log('🔍 Checking articles for content images...');
    
    // Get all posts with content
    const { data: allPosts, error } = await supabase
      .from('posts')
      .select('id, title, status, content, image, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    console.log(`📝 Found ${allPosts.length} total articles`);
    
    allPosts.forEach(post => {
      console.log(`\n📄 Article: "${post.title}" (ID: ${post.id}, Status: ${post.status})`);
      console.log(`   Cover Image: ${post.image || 'No cover image'}`);
      
      // Check for images in content
      const imgMatches = post.content.match(/<img[^>]+src="([^"]*)"[^>]*>/g);
      if (imgMatches) {
        console.log(`   Content Images (${imgMatches.length}):`);
        imgMatches.forEach((img, index) => {
          const srcMatch = img.match(/src="([^"]*)"/);
          if (srcMatch) {
            console.log(`     ${index + 1}. ${srcMatch[1]}`);
          }
        });
      } else {
        console.log(`   Content Images: None found`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking content images:', error);
  }
}

// Run the check
checkContentImages();