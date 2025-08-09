import { createClient } from '@supabase/supabase-js';

// Use service role if provided via env to bypass RLS for maintenance actions
const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

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
    
    // Target: delete lowercase duplicate post by exact ID
    const duplicateId = 'f5dc1e2d-5fb4-44f2-968e-81ca4d78261b';
    const duplicate = allPosts.find(post => post.id === duplicateId);
    
    if (!duplicate) {
      console.log('\n❌ DUPLICATE NOT FOUND: The target post is not in this database');
      return;
    }
    
    console.log(`\n✅ DUPLICATE FOUND: Deleting post "${duplicate.title}" (${duplicate.id}) ...`);

    // Try RPC first if a SECURITY DEFINER function exists (e.g., delete_post_by_id)
    let deleteError = null;
    try {
      const { error: rpcError } = await supabase.rpc('delete_post_by_id', { post_id: duplicateId });
      if (rpcError) deleteError = rpcError;
    } catch (e) {
      // ignore if function doesn't exist
    }

    // Fallback to direct delete
    if (deleteError) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', duplicateId);
      deleteError = error || null;
    }
    
    if (deleteError) {
      console.error('❌ Error deleting post:', deleteError);
      console.error('ℹ️ If RLS blocks deletion, run fix-admin-role.sql to grant an admin role or create a SECURITY DEFINER function to perform deletion.');
      return;
    }
    
    console.log('✅ Post deleted successfully');
    
    // Verify deletion
    const { data: verify, error: verifyError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', duplicateId)
      .maybeSingle();
    
    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
      return;
    }
    
    if (!verify) {
      console.log('✅ Verification passed: Post no longer exists');
    } else {
      console.log('❌ Verification failed: Post still exists');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

directSQLRemove();