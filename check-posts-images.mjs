import { createClient } from '@supabase/supabase-js';

// Use hardcoded config from client.ts
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzePostsImages() {
  console.log('🔍 ANALYZING POSTS TABLE IMAGES...');
  console.log('='.repeat(80));
  
  try {
    // Get all posts with their image status
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, image, status, created_at, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }
    
    console.log(`📊 Total posts found: ${posts.length}`);
    console.log('');
    
    // Categorize posts by image status
    const categories = {
      null: [],
      empty: [],
      content: [],
      valid: [],
      other: []
    };
    
    posts.forEach(post => {
      if (!post.image) {
        categories.null.push(post);
      } else if (post.image === '') {
        categories.empty.push(post);
      } else if (post.image.includes('content')) {
        categories.content.push(post);
      } else if (post.image.startsWith('gallery/') && !post.image.includes('content')) {
        categories.valid.push(post);
      } else {
        categories.other.push(post);
      }
    });
    
    // Display results
    console.log('📋 POSTS BY IMAGE STATUS:');
    console.log(`✅ Valid cover images: ${categories.valid.length}`);
    console.log(`❌ NULL images: ${categories.null.length}`);
    console.log(`❌ Empty images: ${categories.empty.length}`);
    console.log(`❌ Content images: ${categories.content.length}`);
    console.log(`❓ Other format: ${categories.other.length}`);
    console.log('');
    
    // Show broken posts that need fixing
    const brokenPosts = [...categories.null, ...categories.empty, ...categories.content];
    
    if (brokenPosts.length > 0) {
      console.log('🔧 POSTS THAT NEED FIXING:');
      console.log('='.repeat(80));
      
      brokenPosts.forEach((post, index) => {
        console.log(`\n📝 Post ${index + 1}:`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Title: "${post.title}"`);
        console.log(`   Image: ${post.image || 'NULL'}`);
        console.log(`   Status: ${post.status}`);
        console.log(`   Updated: ${post.updated_at}`);
        
        // Determine what needs to be fixed
        let issue = '';
        if (!post.image) {
          issue = 'NULL image - needs cover image path';
        } else if (post.image === '') {
          issue = 'Empty image - needs cover image path';
        } else if (post.image.includes('content')) {
          issue = 'Content image - needs correct cover image path';
        }
        
        console.log(`   Issue: ${issue}`);
      });
      
      console.log('\n' + '='.repeat(80));
      console.log('🔧 SQL FIXES NEEDED:');
      console.log('');
      
      brokenPosts.forEach(post => {
        console.log(`-- Fix post: "${post.title}" (${post.id})`);
        console.log(`UPDATE posts SET image = 'gallery/user/cover.jpg', updated_at = NOW() WHERE id = '${post.id}';`);
        console.log('');
      });
      
    } else {
      console.log('✅ All posts have valid cover images!');
    }
    
    // Show valid posts for reference
    if (categories.valid.length > 0) {
      console.log('\n✅ VALID COVER IMAGES (for reference):');
      console.log('='.repeat(80));
      
      categories.valid.slice(0, 5).forEach((post, index) => {
        console.log(`\n📝 Valid Post ${index + 1}:`);
        console.log(`   ID: ${post.id}`);
        console.log(`   Title: "${post.title}"`);
        console.log(`   Image: ${post.image}`);
        console.log(`   Status: ${post.status}`);
      });
      
      if (categories.valid.length > 5) {
        console.log(`\n... and ${categories.valid.length - 5} more valid posts`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

analyzePostsImages();