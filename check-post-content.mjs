import { createClient } from '@supabase/supabase-js';

// Use hardcoded config from client.ts
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPostContent() {
  console.log('🔍 CHECKING POST CONTENT...');
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
    console.log('📝 POST DETAILS:');
    console.log(`   ID: ${post.id}`);
    console.log(`   Title: "${post.title}"`);
    console.log(`   Cover Image: ${post.image}`);
    console.log(`   Status: ${post.status}`);
    console.log(`   Content Length: ${post.content?.length || 0}`);
    console.log('');
    
    console.log('📄 FULL CONTENT:');
    console.log('='.repeat(80));
    console.log(post.content || 'NO CONTENT');
    console.log('='.repeat(80));
    
    // Check for any image tags in content
    const imgTagRegex = /<img[^>]+>/gi;
    const imgMatches = post.content.match(imgTagRegex);
    
    if (imgMatches) {
      console.log('');
      console.log('🖼️ IMAGE TAGS FOUND IN CONTENT:');
      imgMatches.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
    } else {
      console.log('');
      console.log('✅ No image tags found in content');
    }
    
    // Check for any gallery references
    const galleryRegex = /gallery\/[^"'\s]+/gi;
    const galleryMatches = post.content.match(galleryRegex);
    
    if (galleryMatches) {
      console.log('');
      console.log('📁 GALLERY REFERENCES FOUND IN CONTENT:');
      galleryMatches.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
    } else {
      console.log('');
      console.log('✅ No gallery references found in content');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPostContent();