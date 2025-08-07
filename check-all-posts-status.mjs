import { createClient } from '@supabase/supabase-js';

// Use hardcoded config from client.ts
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllPostsStatus() {
  console.log('🔍 CHECKING ALL POSTS (ALL STATUSES)...');
  console.log('='.repeat(80));
  
  try {
    // Get ALL posts regardless of status
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
    
    // Group by status
    const byStatus = {
      pending: [],
      approved: [],
      rejected: []
    };
    
    posts.forEach(post => {
      if (byStatus[post.status]) {
        byStatus[post.status].push(post);
      }
    });
    
    console.log('📋 POSTS BY STATUS:');
    console.log(`⏳ Pending: ${byStatus.pending.length}`);
    console.log(`✅ Approved: ${byStatus.approved.length}`);
    console.log(`❌ Rejected: ${byStatus.rejected.length}`);
    console.log('');
    
    // Show all posts
    posts.forEach((post, index) => {
      console.log(`\n📝 Post ${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Title: "${post.title}"`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Image: ${post.image || 'NULL'}`);
      console.log(`   Content length: ${post.content?.length || 0}`);
      console.log(`   Created: ${post.created_at}`);
      console.log(`   Updated: ${post.updated_at}`);
      
      // Check if content contains the cover image
      if (post.image && post.content) {
        const imageInContent = post.content.includes(post.image);
        if (imageInContent) {
          console.log(`   ⚠️  ISSUE: Cover image found in content!`);
        }
      }
    });
    
    // Show pending posts specifically
    if (byStatus.pending.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('⏳ PENDING POSTS (these are what you edit):');
      console.log('='.repeat(80));
      
      byStatus.pending.forEach((post, index) => {
        console.log(`\n📝 Pending Post ${index + 1}:`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Title: "${post.title}"`);
        console.log(`   Image: ${post.image || 'NULL'}`);
        console.log(`   Content length: ${post.content?.length || 0}`);
        
        // Check for cover image in content
        if (post.image && post.content) {
          const imageInContent = post.content.includes(post.image);
          if (imageInContent) {
            console.log(`   ❌ PROBLEM: Cover image is in content!`);
            console.log(`   🔧 Need to remove: ${post.image} from content`);
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllPostsStatus();