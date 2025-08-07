import { createClient } from '@supabase/supabase-js';

// Use hardcoded config from client.ts
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPendingPosts() {
  console.log('🔍 CHECKING PENDING POSTS...');
  console.log('='.repeat(80));
  
  try {
    // Get pending posts specifically
    const { data: pendingPosts, error } = await supabase
      .from('posts')
      .select('id, title, content, image, status, created_at, updated_at')
      .eq('status', 'pending')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching pending posts:', error);
      return;
    }
    
    console.log(`📊 Pending posts found: ${pendingPosts.length}`);
    
    if (pendingPosts.length === 0) {
      console.log('⏭️ No pending posts found');
      console.log('');
      console.log('🔍 CHECKING ALL POSTS FOR REFERENCE:');
      console.log('='.repeat(80));
      
      const { data: allPosts, error: allError } = await supabase
        .from('posts')
        .select('id, title, content, image, status, created_at, updated_at')
        .order('updated_at', { ascending: false });
      
      if (allError) {
        console.error('❌ Error fetching all posts:', allError);
        return;
      }
      
      allPosts.forEach((post, index) => {
        console.log(`\n📝 Post ${index + 1}:`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Title: "${post.title}"`);
        console.log(`   Status: ${post.status}`);
        console.log(`   Image: ${post.image || 'NULL'}`);
        console.log(`   Content length: ${post.content?.length || 0}`);
        console.log(`   Updated: ${post.updated_at}`);
        
        // Show content preview if it contains images
        if (post.content && post.content.includes('<img')) {
          console.log(`   📄 Content has images`);
          const imgMatches = post.content.match(/<img[^>]+>/g);
          if (imgMatches) {
            imgMatches.forEach((img, i) => {
              console.log(`      Image ${i + 1}: ${img}`);
            });
          }
        }
      });
      
      return;
    }
    
    // Show pending posts
    pendingPosts.forEach((post, index) => {
      console.log(`\n📝 Pending Post ${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Title: "${post.title}"`);
      console.log(`   Image: ${post.image || 'NULL'}`);
      console.log(`   Content length: ${post.content?.length || 0}`);
      console.log(`   Updated: ${post.updated_at}`);
      
      // Check for cover image in content
      if (post.image && post.content) {
        const imageInContent = post.content.includes(post.image);
        if (imageInContent) {
          console.log(`   ❌ PROBLEM: Cover image is in content!`);
          console.log(`   🔧 Need to remove: ${post.image} from content`);
          
          // Show the content that contains the image
          console.log(`   📄 Content preview:`);
          const lines = post.content.split('\n');
          lines.forEach((line, i) => {
            if (line.includes(post.image)) {
              console.log(`      Line ${i + 1}: ${line.trim()}`);
            }
          });
        }
      }
      
      // Show all image tags in content
      if (post.content && post.content.includes('<img')) {
        console.log(`   🖼️ Images in content:`);
        const imgMatches = post.content.match(/<img[^>]+>/g);
        if (imgMatches) {
          imgMatches.forEach((img, i) => {
            console.log(`      ${i + 1}. ${img}`);
          });
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPendingPosts();