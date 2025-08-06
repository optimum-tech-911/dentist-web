#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixCoverImagesComplete() {
  try {
    console.log('🔧 Starting comprehensive cover image fix...');
    
    // Step 1: Get all posts
    const { data: allPosts, error: postsError } = await supabase
      .from('posts')
      .select('*');
    
    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
      return;
    }
    
    console.log(`📝 Found ${allPosts.length} posts in database`);
    
    // Step 2: Get all gallery images
    const { data: galleryImages, error: galleryError } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (galleryError) {
      console.error('❌ Error fetching gallery images:', galleryError);
      return;
    }
    
    console.log(`🖼️  Found ${galleryImages.length} gallery images`);
    
    if (galleryImages.length === 0) {
      console.log('❌ No gallery images found');
      return;
    }
    
    // Step 3: Show available gallery images
    console.log('\n📋 Available gallery images:');
    galleryImages.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.name}`);
      console.log(`     File path: ${img.file_path}`);
      console.log(`     Size: ${img.file_size} bytes`);
    });
    
    // Step 4: Update posts with cover images
    console.log('\n🔧 Updating posts with cover images...');
    
    for (const post of allPosts) {
      console.log(`\n📝 Processing post: "${post.title}" (ID: ${post.id})`);
      console.log(`   Current cover image: "${post.image || 'null'}"`);
      
      // If post has no cover image, assign the first gallery image
      if (!post.image && galleryImages.length > 0) {
        const selectedImage = galleryImages[0]; // Use the first available image
        console.log(`   Assigning cover image: ${selectedImage.name}`);
        
        const { error: updateError } = await supabase
          .from('posts')
          .update({ image: selectedImage.file_path })
          .eq('id', post.id);
        
        if (updateError) {
          console.error(`   ❌ Failed to update post ${post.id}:`, updateError.message);
        } else {
          console.log(`   ✅ Successfully updated post ${post.id} with cover image`);
        }
      } else if (post.image) {
        console.log(`   Post already has cover image: ${post.image}`);
      }
    }
    
    // Step 5: Verify the updates
    console.log('\n🔍 Verifying updates...');
    const { data: updatedPosts, error: verifyError } = await supabase
      .from('posts')
      .select('*');
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
      return;
    }
    
    console.log('\n📊 Final state:');
    updatedPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. "${post.title}"`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Cover Image: "${post.image || 'null'}"`);
      console.log(`   Author: ${post.author_email}`);
    });
    
    console.log('\n✅ Cover image fix completed!');
    
  } catch (error) {
    console.error('❌ Error in cover image fix:', error);
  }
}

// Run the fix
fixCoverImagesComplete();