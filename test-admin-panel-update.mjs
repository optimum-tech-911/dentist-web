#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminPanelUpdate() {
  console.log('🔍 Testing admin panel update simulation...\n');

  try {
    // Get the post
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with: "${post.title}"`);
    console.log(`📋 Current cover: "${post.image || 'null'}"`);

    // Test the EXACT update that your admin panel does
    const testImage = `admin_panel_test_${Date.now()}.jpg`;
    
    console.log(`🔄 Attempting update with: "${testImage}"`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: testImage })
      .eq('id', post.id)
      .select();

    console.log('📋 Update response:');
    console.log('   Data:', updateData);
    console.log('   Error:', updateError);

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('❌ Error code:', updateError.code);
      console.error('❌ Error message:', updateError.message);
      
      if (updateError.code === '42501') {
        console.log('💡 This is a PERMISSION DENIED error');
        console.log('💡 RLS policies are blocking the update');
      }
    } else {
      console.log('✅ Update appeared successful');
    }

    // Check if it actually worked
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('📋 Verification result:');
      console.log(`   Title: "${verifyData.title}"`);
      console.log(`   Cover: "${verifyData.image || 'null'}"`);
      console.log(`   Changed: ${verifyData.image !== post.image}`);
      
      if (verifyData.image === testImage) {
        console.log('✅ SUCCESS: Update worked!');
      } else {
        console.log('❌ FAILURE: Update was blocked');
        console.log('❌ Expected:', testImage);
        console.log('❌ Actual:', verifyData.image);
      }
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

testAdminPanelUpdate();