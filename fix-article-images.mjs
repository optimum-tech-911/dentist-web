#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to convert signed URLs to public URLs in content
async function convertSignedUrlsToPublic(content) {
  if (!content) return content;
  
  // Find all img tags with gallery signed URLs
  const imgRegex = /<img[^>]+src="([^"]*\/storage\/v1\/object\/sign\/gallery\/[^"]*)"[^>]*>/g;
  let updatedContent = content;
  let match;

  // Reset regex state
  imgRegex.lastIndex = 0;
  
  const urlsToReplace = [];
  
  while ((match = imgRegex.exec(content)) !== null) {
    const signedUrl = match[1];
    try {
      // Extract file path from the signed URL
      const urlParts = signedUrl.split('/gallery/')[1]?.split('?')[0];
      if (urlParts) {
        // Convert to public URL
        const { data } = supabase.storage
          .from('gallery')
          .getPublicUrl(urlParts);
        
        if (data?.publicUrl) {
          urlsToReplace.push({ signed: signedUrl, public: data.publicUrl });
        }
      }
    } catch (error) {
      console.log('Could not convert signed URL to public URL:', error);
    }
  }
  
  // Replace all signed URLs with public URLs
  urlsToReplace.forEach(({ signed, public: publicUrl }) => {
    updatedContent = updatedContent.replace(new RegExp(signed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), publicUrl);
  });

  return { updatedContent, replacements: urlsToReplace.length };
}

async function fixArticleImages() {
  try {
    console.log('🔍 Checking for articles with signed URLs...');
    
    // Get all published posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content, image')
      .eq('status', 'approved');
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    console.log(`📝 Found ${posts.length} published articles to check`);
    
    let updatedCount = 0;
    let totalReplacements = 0;
    
    for (const post of posts) {
      let needsUpdate = false;
      let updatedContent = post.content;
      let updatedImage = post.image;
      
      // Check and convert content images
      if (post.content && post.content.includes('/storage/v1/object/sign/gallery/')) {
        const { updatedContent: newContent, replacements } = await convertSignedUrlsToPublic(post.content);
        if (replacements > 0) {
          updatedContent = newContent;
          needsUpdate = true;
          totalReplacements += replacements;
          console.log(`📷 Found ${replacements} signed URLs in article "${post.title}"`);
        }
      }
      
      // Check and convert header image
      if (post.image && post.image.includes('/storage/v1/object/sign/gallery/')) {
        try {
          const urlParts = post.image.split('/gallery/')[1]?.split('?')[0];
          if (urlParts) {
            const { data } = supabase.storage
              .from('gallery')
              .getPublicUrl(urlParts);
            
            if (data?.publicUrl) {
              updatedImage = data.publicUrl;
              needsUpdate = true;
              totalReplacements += 1;
              console.log(`🖼️  Updated header image for article "${post.title}"`);
            }
          }
        } catch (error) {
          console.log('Could not convert header image URL:', error);
        }
      }
      
      // Update the post if needed
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            content: updatedContent,
            image: updatedImage
          })
          .eq('id', post.id);
        
        if (updateError) {
          console.error(`❌ Error updating post "${post.title}":`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Updated article "${post.title}"`);
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Articles checked: ${posts.length}`);
    console.log(`   Articles updated: ${updatedCount}`);
    console.log(`   Total URL replacements: ${totalReplacements}`);
    
    if (updatedCount > 0) {
      console.log('\n✨ Image URLs have been converted from signed URLs to permanent public URLs!');
      console.log('   Images in articles should now load consistently without expiring.');
    } else {
      console.log('\n✅ No signed URLs found in articles. All images are already using public URLs.');
    }
    
  } catch (error) {
    console.error('❌ Error during image fix process:', error);
  }
}

// Run the fix
fixArticleImages();