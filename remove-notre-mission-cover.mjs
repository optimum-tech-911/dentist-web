import { createClient } from '@supabase/supabase-js';

// Use hardcoded config from client.ts
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeNotreMissionCover() {
  console.log('🔧 REMOVING COVER IMAGE FROM "NOTRE MISSION" POST...');
  console.log('='.repeat(80));
  
  try {
    // First, let's see the current state
    const { data: currentPost, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, content, status')
      .eq('id', '2e731e37-25d9-4bd0-ad71-2dabed1b5a27')
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching post:', fetchError);
      return;
    }
    
    console.log('📝 Current post state:');
    console.log(`   ID: ${currentPost.id}`);
    console.log(`   Title: "${currentPost.title}"`);
    console.log(`   Cover Image: ${currentPost.image || 'NULL'}`);
    console.log(`   Status: ${currentPost.status}`);
    console.log(`   Content Length: ${currentPost.content?.length || 0}`);
    console.log('');
    
    // Remove the cover image
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({
        image: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', '2e731e37-25d9-4bd0-ad71-2dabed1b5a27')
      .select();
    
    if (updateError) {
      console.error('❌ Error updating post:', updateError);
      return;
    }
    
    console.log('✅ COVER IMAGE REMOVED SUCCESSFULLY!');
    console.log('✅ Post will now display without a cover image');
    console.log('✅ Content (YouTube video) remains unchanged');
    console.log('');
    
    // Verify the update
    const { data: updatedPost, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image, content, status')
      .eq('id', '2e731e37-25d9-4bd0-ad71-2dabed1b5a27')
      .single();
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }
    
    console.log('📝 Updated post state:');
    console.log(`   ID: ${updatedPost.id}`);
    console.log(`   Title: "${updatedPost.title}"`);
    console.log(`   Cover Image: ${updatedPost.image || 'NULL'}`);
    console.log(`   Status: ${updatedPost.status}`);
    console.log(`   Content Length: ${updatedPost.content?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

removeNotreMissionCover();