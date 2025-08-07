#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCoverFix() {
  console.log('🔧 Testing cover image fix...\n');

  try {
    // Get a post to test with
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with: "${post.title}"`);
    console.log(`📋 Current cover: "${post.image || 'null'}"`);

    // Test cover image update
    const testImage = `fix_test_${Date.now()}.jpg`;
    
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: testImage })
      .eq('id', post.id)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }

    // Check if it worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('📋 Post after update:', verifyData);
    console.log('🔄 Cover image changed?', verifyData.image !== post.image);
    
    if (verifyData.image === testImage) {
      console.log('✅ SUCCESS: Cover image fix works!');
      console.log('✅ You can now update cover images in admin panel');
    } else {
      console.log('❌ FAILURE: Cover image fix did not work');
      console.log('❌ Expected:', testImage);
      console.log('❌ Actual:', verifyData.image);
    }

    // Restore original
    await supabase
      .from('posts')
      .update({ image: post.image })
      .eq('id', post.id);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testCoverFix();