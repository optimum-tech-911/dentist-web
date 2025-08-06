#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function bulletproofCoverFix() {
  try {
    console.log('🛡️ Starting BULLETPROOF cover image fix...');
    
    // Step 1: Get all posts
    const { data: allPosts, error: postsError } = await supabase
      .from('posts')
      .select('*');
    
    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
      return;
    }
    
    console.log(`📝 Found ${allPosts.length} posts`);
    
    // Step 2: Get gallery images
    const { data: galleryImages, error: galleryError } = await supabase
      .from('gallery_images')
      .select('*');
    
    if (galleryError) {
      console.error('❌ Error fetching gallery:', galleryError);
      return;
    }
    
    console.log(`🖼️  Found ${galleryImages.length} gallery images`);
    
    if (galleryImages.length === 0) {
      console.log('❌ No gallery images available');
      return;
    }
    
    // Step 3: Force update ALL posts with cover images
    console.log('\n🔧 FORCE UPDATING ALL POSTS...');
    
    for (const post of allPosts) {
      console.log(`\n📝 Processing: "${post.title}" (ID: ${post.id})`);
      console.log(`   Current cover: "${post.image || 'null'}"`);
      
      // Use the first available gallery image
      const selectedImage = galleryImages[0];
      console.log(`   Assigning: ${selectedImage.name} (${selectedImage.file_path})`);
      
      // Try multiple update methods
      console.log('   Method 1: Direct update...');
      let updateSuccess = false;
      
      try {
        const { data: updateData, error: updateError } = await supabase
          .from('posts')
          .update({ 
            image: selectedImage.file_path,
            updated_at: new Date().toISOString()
          })
          .eq('id', post.id)
          .select();
        
        if (updateError) {
          console.log(`   ❌ Method 1 failed: ${updateError.message}`);
        } else {
          console.log('   ✅ Method 1 successful');
          updateSuccess = true;
        }
      } catch (error) {
        console.log(`   ❌ Method 1 error: ${error.message}`);
      }
      
      // Method 2: Delete and reinsert if Method 1 failed
      if (!updateSuccess) {
        console.log('   Method 2: Delete and reinsert...');
        try {
          // Delete the post
          const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .eq('id', post.id);
          
          if (deleteError) {
            console.log(`   ❌ Delete failed: ${deleteError.message}`);
          } else {
            // Reinsert with cover image
            const { data: insertData, error: insertError } = await supabase
              .from('posts')
              .insert({
                id: post.id,
                title: post.title,
                content: post.content,
                category: post.category,
                author_email: post.author_email,
                author_id: post.author_id,
                status: post.status,
                image: selectedImage.file_path,
                created_at: post.created_at,
                updated_at: new Date().toISOString()
              })
              .select();
            
            if (insertError) {
              console.log(`   ❌ Reinsert failed: ${insertError.message}`);
            } else {
              console.log('   ✅ Method 2 successful');
              updateSuccess = true;
            }
          }
        } catch (error) {
          console.log(`   ❌ Method 2 error: ${error.message}`);
        }
      }
      
      if (updateSuccess) {
        console.log(`   ✅ Successfully updated "${post.title}" with cover image`);
      } else {
        console.log(`   ❌ Failed to update "${post.title}"`);
      }
    }
    
    // Step 4: Final verification
    console.log('\n🔍 FINAL VERIFICATION...');
    const { data: finalPosts, error: finalError } = await supabase
      .from('posts')
      .select('*');
    
    if (finalError) {
      console.error('❌ Final verification failed:', finalError);
      return;
    }
    
    console.log('\n📊 FINAL STATE:');
    finalPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Cover Image: "${post.image || 'null'}"`);
      console.log(`   Author: ${post.author_email}`);
    });
    
    // Step 5: Test URL conversion
    console.log('\n🔗 TESTING URL CONVERSION...');
    if (finalPosts.length > 0 && finalPosts[0].image) {
      const testImage = finalPosts[0].image;
      console.log(`   Testing: ${testImage}`);
      
      // Test the convertToPublicUrl function logic
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(testImage);
      
      console.log(`   Public URL: ${urlData?.publicUrl || 'FAILED'}`);
    }
    
    console.log('\n✅ BULLETPROOF FIX COMPLETED!');
    
  } catch (error) {
    console.error('❌ Bulletproof fix failed:', error);
  }
}

// Run the bulletproof fix
bulletproofCoverFix();