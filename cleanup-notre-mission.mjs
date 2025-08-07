#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupNotreMission() {
  console.log('🧹 Cleaning up "Notre Mission" cover image...\n');

  try {
    // First, get the current state
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image')
      .eq('title', 'Notre Mission');

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ "Notre Mission" post not found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Found: "${post.title}"`);
    console.log(`📋 Current cover: "${post.image || 'null'}"`);

    // Remove the cover image
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: null })
      .eq('id', post.id)
      .select();

    if (updateError) {
      console.error('❌ Failed to remove cover image:', updateError);
      return;
    }

    // Verify the change
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('📋 After cleanup:');
    console.log(`   Title: "${verifyData.title}"`);
    console.log(`   Cover: "${verifyData.image || 'null'}"`);

    if (verifyData.image === null) {
      console.log('✅ SUCCESS: Cover image removed from "Notre Mission"');
    } else {
      console.log('❌ FAILURE: Cover image was not removed');
      console.log('❌ This confirms the database update issue');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanupNotreMission();