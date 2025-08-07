import { createClient } from '@supabase/supabase-js';

// Use hardcoded config from client.ts
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPostsSave() {
  console.log('🔍 Checking recent posts to see what images are being saved...');
  
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, image, content, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    console.log('✅ Recent posts in database:');
    console.log('='.repeat(80));
    
    data.forEach((post, index) => {
      console.log(`\n📝 Post ${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Title: ${post.title}`);
      console.log(`   Image field: ${post.image || 'NULL'}`);
      console.log(`   Content length: ${post.content?.length || 0}`);
      console.log(`   Updated: ${post.updated_at}`);
      
      // Check if content contains the same image path
      if (post.image && post.content) {
        const imageInContent = post.content.includes(post.image);
        console.log(`   Image found in content? ${imageInContent ? '❌ YES - PROBLEM!' : '✅ NO - GOOD'}`);
        
        if (imageInContent) {
          console.log(`   ⚠️  WARNING: Cover image path is also in content!`);
        }
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 Analysis:');
    console.log(`- Total posts checked: ${data.length}`);
    console.log(`- Posts with images: ${data.filter(p => p.image).length}`);
    console.log(`- Posts with content: ${data.filter(p => p.content).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkPostsSave();