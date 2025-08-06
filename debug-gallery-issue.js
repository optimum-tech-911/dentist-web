// Debug Gallery Issue
// Run this in browser console to diagnose the gallery problem

async function debugGalleryIssue() {
  console.log('🔍 Starting Gallery Debug...');
  
  try {
    // Test 1: Check if Supabase client is working
    console.log('1. Testing Supabase connection...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('Auth status:', authData ? 'Authenticated' : 'Not authenticated');
    if (authError) console.error('Auth error:', authError);
    
    // Test 2: Check if gallery_images table exists
    console.log('2. Testing gallery_images table...');
    const { data: tableData, error: tableError } = await supabase
      .from('gallery_images')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table error:', tableError);
      console.log('This might be a database schema issue');
    } else {
      console.log('✅ Table exists and accessible');
    }
    
    // Test 3: Try to get images
    console.log('3. Testing image retrieval...');
    const { data: images, error: imagesError } = await supabase
      .from('gallery_images')
      .select('*')
      .limit(5);
    
    if (imagesError) {
      console.error('❌ Images error:', imagesError);
    } else {
      console.log('✅ Images retrieved:', images?.length || 0, 'images found');
      if (images && images.length > 0) {
        console.log('Sample image:', images[0]);
      }
    }
    
    // Test 4: Check storage buckets
    console.log('4. Testing storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Buckets error:', bucketsError);
    } else {
      console.log('✅ Available buckets:', buckets?.map(b => b.name) || []);
    }
    
    // Test 5: Check gallery bucket specifically
    console.log('5. Testing gallery bucket...');
    const { data: galleryFiles, error: galleryError } = await supabase.storage
      .from('gallery')
      .list('', { limit: 5 });
    
    if (galleryError) {
      console.error('❌ Gallery bucket error:', galleryError);
    } else {
      console.log('✅ Gallery bucket accessible:', galleryFiles?.length || 0, 'files found');
    }
    
    // Test 6: Check gallery-staging bucket
    console.log('6. Testing gallery-staging bucket...');
    const { data: stagingFiles, error: stagingError } = await supabase.storage
      .from('gallery-staging')
      .list('', { limit: 5 });
    
    if (stagingError) {
      console.error('❌ Gallery-staging bucket error:', stagingError);
    } else {
      console.log('✅ Gallery-staging bucket accessible:', stagingFiles?.length || 0, 'files found');
    }
    
    // Test 7: Check environment variables
    console.log('7. Checking environment...');
    console.log('DEV mode:', import.meta.env.DEV);
    console.log('Environment:', import.meta.env.VITE_ENVIRONMENT);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    
    // Test 8: Check GalleryService
    console.log('8. Testing GalleryService...');
    try {
      const images = await GalleryService.getImages();
      console.log('✅ GalleryService.getImages() works:', images?.length || 0, 'images');
    } catch (serviceError) {
      console.error('❌ GalleryService error:', serviceError);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugGalleryIssue();