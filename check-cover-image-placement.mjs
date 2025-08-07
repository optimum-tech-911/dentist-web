import { createClient } from '@supabase/supabase-js';

// Use hardcoded config from client.ts
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoverImagePlacement() {
  console.log('🔍 CHECKING COVER IMAGE PLACEMENT...');
  console.log('='.repeat(80));
  
  try {
    // Get all posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, content, image, status, created_at, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    console.log(`📊 Total posts found: ${posts.length}`);
    console.log('');
    
    posts.forEach((post, index) => {
      console.log(`\n📝 Post ${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Title: "${post.title}"`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Cover Image: ${post.image || 'NULL'}`);
      console.log(`   Content Length: ${post.content?.length || 0}`);
      console.log(`   Updated: ${post.updated_at}`);
      
      // Check if cover image is in content (WRONG PLACEMENT)
      if (post.image && post.content) {
        const coverImageInContent = post.content.includes(post.image);
        if (coverImageInContent) {
          console.log(`   ❌ PROBLEM: Cover image found in content!`);
          console.log(`   🔧 Need to remove: ${post.image} from content`);
        } else {
          console.log(`   ✅ Cover image is correctly placed (not in content)`);
        }
      }
      
      // Check for any image tags in content
      if (post.content && post.content.includes('<img')) {
        console.log(`   🖼️ Images found in content:`);
        const imgMatches = post.content.match(/<img[^>]+>/g);
        if (imgMatches) {
          imgMatches.forEach((img, i) => {
            console.log(`      ${i + 1}. ${img}`);
          });
        }
      } else {
        console.log(`   ✅ No images in content`);
      }
      
      // Show content preview
      if (post.content) {
        console.log(`   📄 Content preview: ${post.content.substring(0, 100)}...`);
      }
    });
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📋 SUMMARY:');
    
    const postsWithCoverInContent = posts.filter(post => 
      post.image && post.content && post.content.includes(post.image)
    );
    
    const postsWithImagesInContent = posts.filter(post => 
      post.content && post.content.includes('<img')
    );
    
    console.log(`✅ Posts with correct cover placement: ${posts.length - postsWithCoverInContent.length}`);
    console.log(`❌ Posts with cover image in content: ${postsWithCoverInContent.length}`);
    console.log(`🖼️ Posts with images in content: ${postsWithImagesInContent.length}`);
    
    if (postsWithCoverInContent.length > 0) {
      console.log('\n🔧 POSTS THAT NEED FIXING:');
      postsWithCoverInContent.forEach(post => {
        console.log(`   - "${post.title}" (${post.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCoverImagePlacement();