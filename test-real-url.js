import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = "https://cmcfeiskfdbsefzqywbk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testActualImageAccess() {
  console.log('🔍 TESTING ACTUAL IMAGE ACCESS\n');
  
  try {
    // Get an image from database
    const { data: images, error } = await supabase
      .from('gallery_images')
      .select('*')
      .limit(1);
    
    if (error || !images.length) {
      console.error('❌ No images found');
      return;
    }
    
    const testImage = images[0];
    console.log(`📸 Testing image: ${testImage.name}`);
    console.log(`📁 File path: ${testImage.file_path}`);
    
    // Generate signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('gallery')
      .createSignedUrl(testImage.file_path, 3600);
    
    if (urlError) {
      console.error('❌ URL generation error:', urlError);
      return;
    }
    
    console.log(`🔗 Generated URL: ${urlData.signedUrl}`);
    
    // Test if URL actually works
    console.log('\n🌐 Testing HTTP access to image...');
    
    try {
      const response = await fetch(urlData.signedUrl, { method: 'HEAD' });
      
      console.log(`📊 HTTP Status: ${response.status}`);
      console.log(`📝 Content-Type: ${response.headers.get('content-type')}`);
      console.log(`📏 Content-Length: ${response.headers.get('content-length')}`);
      
      if (response.status === 200) {
        console.log('✅ IMAGE IS ACCESSIBLE! The URLs work perfectly.');
        console.log('✅ Gallery bucket exists and images are showing properly.');
        console.log('\n💡 The issue might be elsewhere - let\'s check the frontend...');
      } else {
        console.log('❌ Image not accessible via HTTP');
      }
      
    } catch (fetchError) {
      console.error('❌ HTTP request failed:', fetchError.message);
    }
    
    // Let's also check if we can list files in the bucket
    console.log('\n📋 Checking bucket contents...');
    const { data: files, error: listError } = await supabase.storage
      .from('gallery')
      .list('', { limit: 10 });
      
    if (listError) {
      console.error('❌ Cannot list bucket contents:', listError);
    } else {
      console.log(`📁 Files in bucket: ${files.length}`);
      files.forEach(file => console.log(`   - ${file.name}`));
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testActualImageAccess();