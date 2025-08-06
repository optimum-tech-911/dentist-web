#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSupabaseDirect() {
  try {
    console.log('🔍 DIRECT SUPABASE CHECK - cmcfeiskfdbsefzqywbk');
    
    // Step 1: Check posts table
    console.log('\n📝 CHECKING POSTS TABLE...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
      return;
    }
    
    console.log(`✅ Found ${posts.length} posts in database`);
    
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. "${post.title}"`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Author: ${post.author_email}`);
      console.log(`   Cover Image: "${post.image || 'null'}"`);
      console.log(`   Created: ${post.created_at}`);
      console.log(`   Content length: ${post.content?.length || 0} chars`);
    });
    
    // Step 2: Check gallery_images table
    console.log('\n🖼️  CHECKING GALLERY_IMAGES TABLE...');
    const { data: galleryImages, error: galleryError } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (galleryError) {
      console.error('❌ Error fetching gallery images:', galleryError);
      return;
    }
    
    console.log(`✅ Found ${galleryImages.length} gallery images`);
    
    galleryImages.forEach((img, index) => {
      console.log(`\n${index + 1}. ${img.name}`);
      console.log(`   File path: ${img.file_path}`);
      console.log(`   Size: ${img.file_size} bytes`);
      console.log(`   Type: ${img.file_type}`);
      console.log(`   Created: ${img.created_at}`);
    });
    
    // Step 3: Test database update
    if (posts.length > 0) {
      console.log('\n🧪 TESTING DATABASE UPDATE...');
      const testPost = posts[0];
      const testImage = galleryImages[0];
      
      console.log(`Testing update on post: "${testPost.title}" (${testPost.id})`);
      console.log(`Using image: ${testImage.name} (${testImage.file_path})`);
      
      const { data: updateData, error: updateError } = await supabase
        .from('posts')
        .update({ image: testImage.file_path })
        .eq('id', testPost.id)
        .select();
      
      if (updateError) {
        console.error('❌ Database update failed:', updateError);
      } else {
        console.log('✅ Database update successful:', updateData);
      }
    }
    
    // Step 4: Check RLS policies
    console.log('\n🔐 CHECKING RLS POLICIES...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'posts' });
    
    if (policiesError) {
      console.log('❌ Could not check RLS policies (might not have permission)');
    } else {
      console.log('✅ RLS policies:', policies);
    }
    
    // Step 5: Test URL conversion
    console.log('\n🔗 TESTING URL CONVERSION...');
    if (galleryImages.length > 0) {
      const testImage = galleryImages[0];
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(testImage.file_path);
      
      console.log(`Test image: ${testImage.file_path}`);
      console.log(`Public URL: ${urlData?.publicUrl || 'FAILED'}`);
    }
    
    console.log('\n✅ DIRECT SUPABASE CHECK COMPLETED');
    
  } catch (error) {
    console.error('❌ Error in direct check:', error);
  }
}

// Run the direct check
checkSupabaseDirect();