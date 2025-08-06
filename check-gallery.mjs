#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkGallery() {
  try {
    console.log('🔍 Checking gallery images...');
    
    // Get all gallery images
    const { data: images, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching gallery images:', error);
      return;
    }
    
    console.log(`📝 Found ${images.length} images in gallery`);
    
    if (images.length > 0) {
      console.log('\n🖼️ Available images:');
      images.forEach((image, index) => {
        console.log(`  ${index + 1}. ${image.name}`);
        console.log(`     File path: ${image.file_path}`);
        console.log(`     Size: ${image.file_size} bytes`);
        console.log(`     Type: ${image.file_type}`);
        console.log(`     Uploaded by: ${image.uploaded_by}`);
        console.log(`     Created: ${image.created_at}`);
        console.log('');
      });
    } else {
      console.log('❌ No images found in gallery');
    }
    
  } catch (error) {
    console.error('❌ Error checking gallery:', error);
  }
}

// Run the check
checkGallery();