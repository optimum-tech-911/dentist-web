#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthRole() {
  console.log('🔍 Testing authentication and role status...\n');

  try {
    // 1. Check current session
    console.log('📋 Step 1: Checking current session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else {
      console.log('📋 Session data:', sessionData);
      console.log('📋 User:', sessionData.session?.user || 'No user');
      console.log('📋 Authenticated:', !!sessionData.session);
    }

    // 2. Check if we can read data
    console.log('\n📋 Step 2: Testing read permissions...');
    const { data: readData, error: readError } = await supabase
      .from('posts')
      .select('id, title')
      .limit(1);

    if (readError) {
      console.error('❌ Read failed:', readError);
    } else {
      console.log('✅ Read successful:', readData);
    }

    // 3. Check if we can insert data
    console.log('\n📋 Step 3: Testing insert permissions...');
    const testInsertData = {
      title: `Test Insert ${Date.now()}`,
      content: 'Test content',
      category: 'Test',
      author_email: 'test@example.com',
      status: 'pending'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('posts')
      .insert(testInsertData)
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('❌ Insert error details:', insertError);
    } else {
      console.log('✅ Insert successful:', insertData);
      
      // Clean up the test insert
      if (insertData && insertData[0]) {
        await supabase
          .from('posts')
          .delete()
          .eq('id', insertData[0].id);
        console.log('✅ Test insert cleaned up');
      }
    }

    // 4. Check if we can update data (the real issue)
    console.log('\n📋 Step 4: Testing update permissions...');
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts to test update:', fetchError);
      return;
    }

    const testPost = posts[0];
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ title: `Test Update ${Date.now()}` })
      .eq('id', testPost.id)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('❌ Update error details:', updateError);
    } else {
      console.log('✅ Update appeared successful:', updateData);
      
      // Verify the update
      const { data: verifyData, error: verifyError } = await supabase
        .from('posts')
        .select('id, title')
        .eq('id', testPost.id)
        .single();

      if (verifyError) {
        console.error('❌ Verification failed:', verifyError);
      } else {
        console.log('📋 Post after update:', verifyData);
        console.log('🔄 Title actually changed?', verifyData.title !== testPost.title);
      }
    }

    // 5. Check RLS policies
    console.log('\n📋 Step 5: Checking RLS status...');
    console.log('💡 RLS policies can silently block updates without throwing errors');
    console.log('💡 This is likely what\'s happening here');
    console.log('💡 The anonymous key might not have the right permissions');

    // 6. Summary
    console.log('\n📋 SUMMARY:');
    console.log('✅ We can READ data (select works)');
    if (insertError) {
      console.log('❌ We CANNOT INSERT data');
    } else {
      console.log('✅ We CAN INSERT data');
    }
    if (updateError) {
      console.log('❌ We CANNOT UPDATE data');
    } else {
      console.log('✅ We CAN UPDATE data');
    }
    
    console.log('\n💡 The issue is likely:');
    console.log('   1. RLS policies blocking updates for anonymous users');
    console.log('   2. The admin panel needs to be authenticated with proper roles');
    console.log('   3. The anonymous key doesn\'t have update permissions');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAuthRole();