#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to convert file_path to public URL
function convertFilePathToPublicUrl(filePath) {
  if (!filePath) return null;
  
  try {
    const { data } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);
    
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error converting file path to public URL:', error);
    return null;
  }
}

async function fixCoverImages() {
  try {
    console.log('🔍 Checking for articles with file_path format cover images...');
    
    // Get all posts with images
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, image')
      .not('image', 'is', null);
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    console.log(`📝 Found ${posts.length} articles with images to check`);
    
    let updatedCount = 0;
    
    for (const post of posts) {
      // Check if the image is a file_path (doesn't start with http)
      if (post.image && !post.image.startsWith('http')) {
        console.log(`🔄 Converting cover image for article "${post.title}":`, post.image);
        
        const publicUrl = convertFilePathToPublicUrl(post.image);
        
        if (publicUrl) {
          // Update the post with the public URL
          const { error: updateError } = await supabase
            .from('posts')
            .update({ image: publicUrl })
            .eq('id', post.id);
          
          if (updateError) {
            console.error(`❌ Error updating post ${post.id}:`, updateError);
          } else {
            console.log(`✅ Updated cover image for "${post.title}":`, publicUrl);
            updatedCount++;
          }
        } else {
          console.error(`❌ Could not convert file path to public URL for "${post.title}":`, post.image);
        }
      } else if (post.image && post.image.startsWith('http')) {
        console.log(`✅ Article "${post.title}" already has correct URL format`);
      }
    }
    
    console.log(`\n🎉 Fix completed! Updated ${updatedCount} articles.`);
    
  } catch (error) {
    console.error('❌ Error fixing cover images:', error);
  }
}

// Run the fix
fixCoverImages();