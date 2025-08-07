#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseConstraints() {
  console.log('🔍 Checking database constraints and triggers...\n');

  try {
    // Get a post to test with
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
    console.log(`📋 Current data:`, post);

    // Test 1: Try to update a simple text field
    console.log('\n🔄 Test 1: Update title field...');
    const newTitle = `Test Title ${Date.now()}`;
    const { data: titleUpdate, error: titleError } = await supabase
      .from('posts')
      .update({ title: newTitle })
      .eq('id', post.id)
      .select();

    if (titleError) {
      console.error('❌ Title update failed:', titleError);
    } else {
      console.log('✅ Title update appeared successful');
    }

    // Test 2: Try to update content field
    console.log('\n🔄 Test 2: Update content field...');
    const newContent = `Test content ${Date.now()}`;
    const { data: contentUpdate, error: contentError } = await supabase
      .from('posts')
      .update({ content: newContent })
      .eq('id', post.id)
      .select();

    if (contentError) {
      console.error('❌ Content update failed:', contentError);
    } else {
      console.log('✅ Content update appeared successful');
    }

    // Test 3: Try to update category field
    console.log('\n🔄 Test 3: Update category field...');
    const newCategory = `test-category-${Date.now()}`;
    const { data: categoryUpdate, error: categoryError } = await supabase
      .from('posts')
      .update({ category: newCategory })
      .eq('id', post.id)
      .select();

    if (categoryError) {
      console.error('❌ Category update failed:', categoryError);
    } else {
      console.log('✅ Category update appeared successful');
    }

    // Check final state
    console.log('\n🔍 Checking final state...');
    const { data: finalPost, error: finalError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', post.id)
      .single();

    if (finalError) {
      console.error('❌ Error checking final state:', finalError);
    } else {
      console.log('📋 Final post state:');
      console.log(`   Title: "${finalPost.title}" (was: "${post.title}")`);
      console.log(`   Content: "${finalPost.content?.substring(0, 50)}..." (changed: ${finalPost.content !== post.content})`);
      console.log(`   Category: "${finalPost.category}" (was: "${post.category}")`);
      console.log(`   Image: "${finalPost.image}" (was: "${post.image}")`);
      console.log(`   Status: ${finalPost.status} (was: ${post.status})`);
      
      console.log('\n📊 Analysis:');
      console.log(`   Title changed: ${finalPost.title !== post.title}`);
      console.log(`   Content changed: ${finalPost.content !== post.content}`);
      console.log(`   Category changed: ${finalPost.category !== post.category}`);
      console.log(`   Image changed: ${finalPost.image !== post.image}`);
      console.log(`   Status changed: ${finalPost.status !== post.status}`);
      
      if (finalPost.title === post.title && finalPost.content === post.content) {
        console.log('\n💡 ALL UPDATES ARE BEING BLOCKED');
        console.log('💡 This suggests a database-level issue, not just RLS');
        console.log('💡 Possible causes:');
        console.log('   - Database triggers reverting changes');
        console.log('   - Row-level security policies');
        console.log('   - Database constraints');
        console.log('   - Supabase real-time subscriptions reverting changes');
      } else {
        console.log('\n✅ Some updates work, others don\'t');
        console.log('💡 This suggests field-specific restrictions');
      }
    }

    // Restore original
    await supabase
      .from('posts')
      .update({ 
        title: post.title,
        content: post.content,
        category: post.category,
        image: post.image,
        status: post.status
      })
      .eq('id', post.id);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabaseConstraints();