#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPendingCoverUpdate() {
  try {
    console.log('🧪 Testing cover image update for pending posts...');
    
    // First, let's check if there are any pending posts
    const { data: pendingPosts, error: pendingError } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending');
    
    if (pendingError) {
      console.error('❌ Error fetching pending posts:', pendingError);
      return;
    }
    
    console.log(`📝 Found ${pendingPosts?.length || 0} pending posts`);
    
    if (!pendingPosts || pendingPosts.length === 0) {
      console.log('💡 No pending posts found. Let\'s test with an approved post instead...');
      
      // Test with approved post
      const { data: approvedPosts, error: approvedError } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'approved')
        .limit(1);
      
      if (approvedError || !approvedPosts || approvedPosts.length === 0) {
        console.error('❌ No posts found at all');
        return;
      }
      
      const post = approvedPosts[0];
      console.log(`📝 Testing with approved post: "${post.title}" (ID: ${post.id})`);
      console.log(`   Current cover: "${post.image || 'null'}"`);
      
      // Test cover image update
      const testCoverImage = 'test-approved-cover.jpg';
      
      console.log(`🖼️  Updating cover image to: ${testCoverImage}`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('posts')
        .update({ image: testCoverImage })
        .eq('id', post.id)
        .select();
      
      if (updateError) {
        console.error('❌ Update failed:', updateError);
        console.error('❌ Error code:', updateError.code);
        console.error('❌ Error message:', updateError.message);
      } else {
        console.log('✅ Update appeared successful');
        console.log('📊 Update result:', updateResult);
        
        // Verify the update
        const { data: verifyData, error: verifyError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', post.id)
          .single();
        
        if (verifyError) {
          console.error('❌ Verification failed:', verifyError);
        } else {
          console.log('🔍 Verification:');
          console.log(`   Cover Image: "${verifyData.image || 'null'}"`);
          console.log(`   Cover image updated? ${verifyData.image === testCoverImage}`);
          
          if (verifyData.image !== testCoverImage) {
            console.log('🚨 ISSUE CONFIRMED: Update appears successful but data doesn\'t change');
            console.log('💡 This means RLS policy is silently blocking the update');
          }
        }
        
        // Restore original
        await supabase
          .from('posts')
          .update({ image: post.image })
          .eq('id', post.id);
      }
      
    } else {
      // Test with pending post
      const post = pendingPosts[0];
      console.log(`📝 Testing with pending post: "${post.title}" (ID: ${post.id})`);
      console.log(`   Current cover: "${post.image || 'null'}"`);
      
      // Test cover image update
      const testCoverImage = 'test-pending-cover.jpg';
      
      console.log(`🖼️  Updating cover image to: ${testCoverImage}`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('posts')
        .update({ image: testCoverImage })
        .eq('id', post.id)
        .select();
      
      if (updateError) {
        console.error('❌ Update failed:', updateError);
        console.error('❌ Error code:', updateError.code);
        console.error('❌ Error message:', updateError.message);
      } else {
        console.log('✅ Update appeared successful');
        console.log('📊 Update result:', updateResult);
        
        // Verify the update
        const { data: verifyData, error: verifyError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', post.id)
          .single();
        
        if (verifyError) {
          console.error('❌ Verification failed:', verifyError);
        } else {
          console.log('🔍 Verification:');
          console.log(`   Cover Image: "${verifyData.image || 'null'}"`);
          console.log(`   Cover image updated? ${verifyData.image === testCoverImage}`);
          
          if (verifyData.image !== testCoverImage) {
            console.log('🚨 ISSUE CONFIRMED: Update appears successful but data doesn\'t change');
            console.log('💡 This means RLS policy is silently blocking the update');
          }
        }
        
        // Restore original
        await supabase
          .from('posts')
          .update({ image: post.image })
          .eq('id', post.id);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testPendingCoverUpdate();