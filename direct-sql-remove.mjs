import { createClient } from '@supabase/supabase-js';

// Use hardcoded config from client.ts
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function directSQLRemove() {
  console.log('🔧 DIRECT SQL REMOVE COVER IMAGE...');
  console.log('='.repeat(80));
  
  try {
    // First, let's see ALL posts to make sure we're in the right database
    const { data: allPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, status, updated_at')
      .order('updated_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching posts:', fetchError);
      return;
    }
    
    console.log('📊 ALL POSTS IN DATABASE:');
    allPosts.forEach((post, index) => {
      console.log(`\n📝 Post ${index + 1}:`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Title: "${post.title}"`);
      console.log(`   Image: ${post.image || 'NULL'}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Updated: ${post.updated_at}`);
    });
    
    // Check if the specific post exists
    const notreMissionPost = allPosts.find(post => post.id === '2e731e37-25d9-4bd0-ad71-2dabed1b5a27');
    
    if (!notreMissionPost) {
      console.log('\n❌ POST NOT FOUND: The Notre Mission post is not in this database');
      console.log('🔍 This might be a different deployment or database');
      return;
    }
    
    console.log('\n✅ POST FOUND: Updating Notre Mission post...');
    
    // Try direct SQL update
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_post_image', {
        post_id: '2e731e37-25d9-4bd0-ad71-2dabed1b5a27',
        new_image: null
      });
    
    if (updateError) {
      console.log('❌ RPC failed, trying direct update...');
      
      // Try direct update
      const { data: directUpdate, error: directError } = await supabase
        .from('posts')
        .update({ 
          image: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', '2e731e37-25d9-4bd0-ad71-2dabed1b5a27')
        .select();
      
      if (directError) {
        console.error('❌ Direct update failed:', directError);
        return;
      }
      
      console.log('✅ Direct update result:', directUpdate);
    } else {
      console.log('✅ RPC update result:', updateResult);
    }
    
    // Verify the update
    const { data: verifyPost, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .eq('id', '2e731e37-25d9-4bd0-ad71-2dabed1b5a27')
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }
    
    console.log('\n📝 FINAL POST STATE:');
    console.log(`   ID: ${verifyPost.id}`);
    console.log(`   Title: "${verifyPost.title}"`);
    console.log(`   Image: ${verifyPost.image || 'NULL'}`);
    console.log(`   Status: ${verifyPost.status}`);
    
    if (verifyPost.image === null) {
      console.log('✅ SUCCESS: Cover image removed!');
    } else {
      console.log('❌ FAILED: Cover image still present');
      console.log('🔍 This might be a different database than the one you\'re viewing');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

directSQLRemove();