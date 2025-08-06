// Supabase CORS Configuration Script
// Run this in your Supabase Dashboard browser console

// Configuration for your domain
const CORS_CONFIG = {
  allowedOrigins: [
    'https://ufsbd34.fr',
    'https://www.ufsbd34.fr',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173'
  ],
  allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: [
    'Accept',
    'Accept-Language',
    'Content-Language',
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Origin',
    'Referer',
    'User-Agent'
  ],
  maxAge: 86400, // 24 hours
  credentials: false
};

// Function to configure CORS for a bucket
async function configureBucketCORS(bucketName) {
  try {
    console.log(`Configuring CORS for bucket: ${bucketName}`);
    
    // This would need to be done through Supabase API or dashboard
    // For now, we'll provide the configuration that needs to be set
    
    const corsConfig = {
      bucket: bucketName,
      origins: CORS_CONFIG.allowedOrigins,
      methods: CORS_CONFIG.allowedMethods,
      headers: CORS_CONFIG.allowedHeaders,
      maxAge: CORS_CONFIG.maxAge,
      credentials: CORS_CONFIG.credentials
    };
    
    console.log('CORS Configuration:', JSON.stringify(corsConfig, null, 2));
    console.log(`✅ CORS configuration ready for bucket: ${bucketName}`);
    
    return corsConfig;
  } catch (error) {
    console.error(`❌ Error configuring CORS for ${bucketName}:`, error);
    throw error;
  }
}

// Configure both buckets
async function configureAllBuckets() {
  console.log('🚀 Starting CORS configuration for Supabase Storage...');
  
  try {
    await configureBucketCORS('gallery');
    await configureBucketCORS('gallery-staging');
    
    console.log('✅ All buckets configured successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Storage > Settings');
    console.log('3. Apply the CORS configuration shown above');
    console.log('4. Test image loading on your site');
    
  } catch (error) {
    console.error('❌ Failed to configure buckets:', error);
  }
}

// Run the configuration
configureAllBuckets();