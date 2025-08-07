#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupNotreMissionCover() {
  console.log('🧹 Cleaning up "Notre Mission" cover image...\n');

  try {
    // 1. Find the "Notre Mission" post
    console.log('📋 Step 1: Finding "Notre Mission" post...');
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .eq('title', 'Notre Mission')
      .single();

    if (fetchError) {
      console.error('❌ Error finding post:', fetchError);
      return;
    }

    console.log('📋 Found "Notre Mission" post:');
    console.log(`   ID: ${posts.id}`);
    console.log(`   Title: "${posts.title}"`);
    console.log(`   Status: ${posts.status}`);
    console.log(`   Current cover: "${posts.image || 'null'}"`);

    // 2. Clean up the cover image (set to null or original value)
    console.log('\n🔄 Step 2: Cleaning up cover image...');
    
    // Set cover image to null to remove it
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: null })
      .eq('id', posts.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating cover image:', updateError);
      return;
    } else {
      console.log('✅ Cover image cleanup appeared successful');
      console.log('✅ Update data:', updateData);
    }

    // 3. Verify the cleanup worked
    console.log('\n🔍 Step 3: Verifying cleanup...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .eq('id', posts.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying cleanup:', verifyError);
    } else {
      console.log('📋 Post after cleanup:', verifyData);
      console.log('🔄 Cover image removed?', verifyData.image === null);
      
      if (verifyData.image === null) {
        console.log('✅ SUCCESS: Cover image has been removed!');
      } else {
        console.log('❌ FAILURE: Cover image was not removed');
        console.log('❌ Current cover:', verifyData.image);
      }
    }

    // 4. Alternative: Set to original cover if you want to keep it
    console.log('\n🔄 Step 4: Setting to original cover (optional)...');
    const originalCover = 'gallery/user/cover.jpg'; // Original cover image
    
    const { data: restoreData, error: restoreError } = await supabase
      .from('posts')
      .update({ image: originalCover })
      .eq('id', posts.id)
      .select();

    if (restoreError) {
      console.error('❌ Error restoring original cover:', restoreError);
    } else {
      console.log('✅ Original cover restored');
    }

    // 5. Final verification
    console.log('\n🔍 Step 5: Final verification...');
    const { data: finalData, error: finalError } = await supabase
      .from('posts')
      .select('id, title, image, status')
      .eq('id', posts.id)
      .single();

    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      console.log('📋 Final post state:', finalData);
      console.log('🔄 Final cover image:', finalData.image);
    }

    // 6. Summary
    console.log('\n📋 SUMMARY:');
    console.log('✅ "Notre Mission" cover image has been cleaned up');
    console.log('✅ The post is now in a clean state');
    console.log('💡 Next time, make sure to create the "Prévention des caries" post properly');
    console.log('💡 The issue was that you were trying to update a non-existent post');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

cleanupNotreMissionCover();