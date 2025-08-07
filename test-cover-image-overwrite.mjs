#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCoverImageOverwrite() {
  console.log('🔍 Testing cover image overwrite scenario...\n');

  try {
    // 1. Get a post to test with
    console.log('📋 Step 1: Getting a post to test with...');
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, image, content, status')
      .limit(1);

    if (fetchError || !posts || posts.length === 0) {
      console.error('❌ No posts found:', fetchError);
      return;
    }

    const post = posts[0];
    console.log(`📋 Testing with post: "${post.title}"`);
    console.log(`📋 Current cover: "${post.image || 'null'}"`);
    console.log(`📋 Content length: ${post.content?.length || 0}`);
    
    // 2. Check if content contains any images
    console.log('\n🔍 Step 2: Checking content for images...');
    const imgRegex = /<img[^>]+src="([^"]*)"[^>]*>/g;
    const contentImages = [];
    let match;
    
    while ((match = imgRegex.exec(post.content || '')) !== null) {
      contentImages.push(match[1]);
    }
    
    console.log(`📋 Found ${contentImages.length} images in content:`);
    contentImages.forEach((img, index) => {
      console.log(`   ${index + 1}. ${img}`);
    });

    // 3. Set a specific cover image
    console.log('\n🔄 Step 3: Setting a specific cover image...');
    const newCoverImage = `test_cover_specific_${Date.now()}.jpg`;
    
    const { data: updateData, error: updateError } = await supabase
      .from('posts')
      .update({ image: newCoverImage })
      .eq('id', post.id)
      .select();

    if (updateError) {
      console.error('❌ Cover image update failed:', updateError);
      return;
    } else {
      console.log('✅ Cover image update appeared successful');
    }

    // 4. Check if cover image was set correctly
    console.log('\n🔍 Step 4: Checking if cover image was set correctly...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('posts')
      .select('id, title, image, content')
      .eq('id', post.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('📋 Post after cover image update:', verifyData);
    console.log('🔄 Cover image set correctly?', verifyData.image === newCoverImage);
    
    if (verifyData.image === newCoverImage) {
      console.log('✅ SUCCESS: Cover image was set correctly');
    } else {
      console.log('❌ FAILURE: Cover image was not set correctly');
      console.log('❌ Expected:', newCoverImage);
      console.log('❌ Actual:', verifyData.image);
    }

    // 5. Simulate content processing (like EditBlog does)
    console.log('\n🔄 Step 5: Simulating content processing...');
    const processedContent = post.content; // In real app, this would process content images
    
    // 6. Update with processed content (like EditBlog does)
    console.log('\n🔄 Step 6: Updating with processed content...');
    const { data: contentUpdateData, error: contentUpdateError } = await supabase
      .from('posts')
      .update({ 
        content: processedContent,
        image: newCoverImage // Keep the same cover image
      })
      .eq('id', post.id)
      .select();

    if (contentUpdateError) {
      console.error('❌ Content update failed:', contentUpdateError);
    } else {
      console.log('✅ Content update appeared successful');
    }

    // 7. Check final state
    console.log('\n🔍 Step 7: Checking final state...');
    const { data: finalData, error: finalError } = await supabase
      .from('posts')
      .select('id, title, image, content')
      .eq('id', post.id)
      .single();

    if (finalError) {
      console.error('❌ Final check failed:', finalError);
    } else {
      console.log('📋 Final post state:', finalData);
      console.log('🔄 Cover image still correct?', finalData.image === newCoverImage);
      
      if (finalData.image === newCoverImage) {
        console.log('✅ SUCCESS: Cover image remained correct after content update');
      } else {
        console.log('❌ FAILURE: Cover image was overwritten during content update');
        console.log('❌ Expected:', newCoverImage);
        console.log('❌ Actual:', finalData.image);
        
        // Check if it was overwritten by a content image
        const wasOverwrittenByContent = contentImages.some(contentImg => 
          finalData.image && contentImg.includes(finalData.image)
        );
        
        if (wasOverwrittenByContent) {
          console.log('💡 DIAGNOSIS: Cover image was overwritten by a content image!');
        } else {
          console.log('💡 DIAGNOSIS: Cover image was overwritten by something else');
        }
      }
    }

    // 8. Restore original state
    console.log('\n🔄 Step 8: Restoring original state...');
    await supabase
      .from('posts')
      .update({ 
        image: post.image,
        content: post.content 
      })
      .eq('id', post.id);
    
    console.log('✅ Original state restored');

    // 9. Summary
    console.log('\n📋 SUMMARY:');
    if (finalData.image === newCoverImage) {
      console.log('✅ COVER IMAGE UPDATES WORK CORRECTLY');
      console.log('✅ The issue might be in the UI or specific conditions');
    } else {
      console.log('❌ COVER IMAGE GETS OVERWRITTEN');
      console.log('❌ This confirms the issue you described');
      console.log('💡 The problem is likely in the content processing or database triggers');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testCoverImageOverwrite();