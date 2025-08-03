import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cmcfeiskfdbsefzqywbk.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA5MDAzMiwiZXhwIjoyMDY3NjY2MDMyfQ.iNYzFiIzgIJeEr4VyDKlOyIFO4VJcPxRIrJGIgDf3P0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createGalleryBucket() {
  try {
    console.log('🔧 Setting up gallery storage bucket...');
    
    // Create the gallery bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('gallery', {
      public: true,
      fileSizeLimit: 20971520, // 20MB
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg'
      ]
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Gallery bucket already exists');
      } else {
        console.error('❌ Error creating bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ Gallery bucket created successfully');
    }

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const galleryBucket = buckets.find(b => b.id === 'gallery');
    if (galleryBucket) {
      console.log('✅ Gallery bucket confirmed:', galleryBucket);
    } else {
      console.log('❌ Gallery bucket not found after creation');
    }

    // Now create RLS policies using SQL
    console.log('🔧 Setting up storage policies...');
    
    const policies = [
      // Drop existing policies
      `DROP POLICY IF EXISTS "Allow authenticated users to upload gallery images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated users to view gallery images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow users to update their own gallery images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow users to delete their own gallery images" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated users to upload gallery media" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow authenticated users to view gallery media" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow users to update their own gallery media" ON storage.objects;`,
      `DROP POLICY IF EXISTS "Allow users to delete their own gallery media" ON storage.objects;`,
      
      // Create new policies
      `CREATE POLICY "Allow authenticated users to upload gallery media" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'gallery' AND 
          auth.role() = 'authenticated'
        );`,
      
      `CREATE POLICY "Allow authenticated users to view gallery media" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'gallery' AND 
          auth.role() = 'authenticated'
        );`,
      
      `CREATE POLICY "Allow users to update their own gallery media" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'gallery' AND 
          auth.uid()::text = (storage.foldername(name))[1]
        );`,
      
      `CREATE POLICY "Allow users to delete their own gallery media" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'gallery' AND 
          auth.uid()::text = (storage.foldername(name))[1]
        );`
    ];

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error && !error.message.includes('does not exist')) {
          console.error('❌ Policy error:', error.message);
        }
      } catch (err) {
        console.log('Note: Some policies may already exist or be handled differently');
      }
    }

    console.log('✅ Gallery bucket setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

createGalleryBucket();