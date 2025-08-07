import { createClient } from '@supabase/supabase-js';

// Use hardcoded config from client.ts
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanArticleContent() {
  console.log('🔧 CLEANING ARTICLE CONTENT...');
  console.log('='.repeat(80));
  
  try {
    // Get the specific post
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content, image, status')
      .eq('id', '2e731e37-25d9-4bd0-ad71-2dabed1b5a27');
    
    if (error) {
      console.error('❌ Error fetching post:', error);
      return;
    }
    
    if (!posts || posts.length === 0) {
      console.log('❌ Post not found');
      return;
    }
    
    const post = posts[0];
    console.log('📝 Current post:');
    console.log(`   ID: ${post.id}`);
    console.log(`   Title: "${post.title}"`);
    console.log(`   Cover Image: ${post.image}`);
    console.log(`   Status: ${post.status}`);
    console.log('');
    
    // Check if content contains the cover image
    const coverImageInContent = post.content && post.content.includes(post.image);
    console.log('🔍 Analysis:');
    console.log(`   Content length: ${post.content?.length || 0}`);
    console.log(`   Cover image in content? ${coverImageInContent ? '❌ YES - NEEDS CLEANING' : '✅ NO - CLEAN'}`);
    
    if (coverImageInContent) {
      console.log('');
      console.log('🔧 CONTENT CLEANING NEEDED:');
      console.log('='.repeat(80));
      
      // Show what needs to be removed
      const imgTagRegex = /<img[^>]+src="[^"]*gallery\/user\/cover\.jpg[^"]*"[^>]*>/gi;
      const matches = post.content.match(imgTagRegex);
      
      if (matches) {
        console.log('📋 Found image tags to remove:');
        matches.forEach((match, index) => {
          console.log(`   ${index + 1}. ${match}`);
        });
      }
      
      // Create cleaned content
      let cleanedContent = post.content;
      
      // Remove img tags with the cover image
      cleanedContent = cleanedContent.replace(
        /<img[^>]+src="[^"]*gallery\/user\/cover\.jpg[^"]*"[^>]*>/gi,
        '<!-- REMOVED COVER IMAGE -->'
      );
      
      // Remove any remaining references to the cover image
      cleanedContent = cleanedContent.replace(
        /gallery\/user\/cover\.jpg/gi,
        '<!-- REMOVED COVER IMAGE PATH -->'
      );
      
      console.log('');
      console.log('🧹 CLEANED CONTENT:');
      console.log('='.repeat(80));
      console.log(cleanedContent);
      console.log('='.repeat(80));
      
      // Update the post
      const { data: updateData, error: updateError } = await supabase
        .from('posts')
        .update({
          content: cleanedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id)
        .select();
      
      if (updateError) {
        console.error('❌ Error updating post:', updateError);
        return;
      }
      
      console.log('');
      console.log('✅ POST UPDATED SUCCESSFULLY!');
      console.log('✅ Cover image removed from content');
      console.log('✅ Cover image remains in image field');
      
    } else {
      console.log('✅ Content is already clean - no cover image found in content');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanArticleContent();