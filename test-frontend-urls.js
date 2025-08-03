import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cmcfeiskfdbsefzqywbk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// This mimics the EXACT same code that's in lib/gallery.ts getImages() function
async function testFrontendGalleryService() {
  console.log('🔍 TESTING FRONTEND GALLERY SERVICE (exact same code)\n');
  
  try {
    // Step 1: Get images from database (same as frontend)
    console.log('📋 Step 1: Fetching from gallery_images table...');
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    console.log(`✅ Found ${data.length} images in database`);

    // Step 2: Generate signed URLs for all images (same as frontend)
    console.log('\n📋 Step 2: Generating signed URLs...');
    const imagesWithUrls = await Promise.all(
      data.map(async (image) => {
        console.log(`   Generating URL for: ${image.name}`);
        
        const { data: urlData, error: urlError } = await supabase.storage
          .from('gallery')
          .createSignedUrl(image.file_path, 3600); // 1 hour expiry

        if (urlError) {
          console.error(`   ❌ URL error for ${image.name}:`, urlError);
          return {
            ...image,
            url: ''
          };
        }

        console.log(`   ✅ URL generated: ${urlData.signedUrl?.substring(0, 80)}...`);
        
        return {
          ...image,
          url: urlData?.signedUrl || ''
        };
      })
    );

    console.log('\n📋 Step 3: Final result (what frontend receives)...');
    imagesWithUrls.forEach((img, index) => {
      console.log(`\n🖼️  Image ${index + 1}:`);
      console.log(`   Name: ${img.name}`);
      console.log(`   URL: ${img.url ? 'GENERATED ✅' : 'EMPTY ❌'}`);
      console.log(`   URL length: ${img.url.length} chars`);
      
      if (img.url) {
        console.log(`   URL preview: ${img.url.substring(0, 100)}...`);
      }
    });

    // Test what happens when we try to access these URLs
    console.log('\n📋 Step 4: Testing if these URLs would work in browser...');
    
    if (imagesWithUrls.length > 0 && imagesWithUrls[0].url) {
      const testUrl = imagesWithUrls[0].url;
      
      try {
        const response = await fetch(testUrl, { method: 'HEAD' });
        console.log(`✅ First image HTTP test: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
          console.log('✅ URLs ARE WORKING! Images should be visible in frontend.');
          console.log('\n💡 If images still not showing, check:');
          console.log('   - Browser console for errors');
          console.log('   - Image loading errors in Network tab'); 
          console.log('   - CORS issues');
          console.log('   - Frontend error handling');
        }
        
      } catch (error) {
        console.error('❌ HTTP test failed:', error.message);
      }
    }

    return imagesWithUrls;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testFrontendGalleryService();