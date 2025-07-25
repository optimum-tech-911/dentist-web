import { supabaseConnection, checkSupabaseHealth } from './supabase-connection';

/**
 * Test Supabase connection functionality
 */
export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection...');
  
  try {
    // Test initial connection
    const health = await checkSupabaseHealth();
    console.log('📊 Connection Health:', health);
    
    // Start keep-alive
    supabaseConnection.startKeepAlive(1); // Test with 1 minute interval
    
    // Wait a bit and test again
    setTimeout(async () => {
      const health2 = await checkSupabaseHealth();
      console.log('📊 Connection Health (after 2s):', health2);
      
      // Stop keep-alive
      supabaseConnection.stopKeepAlive();
      console.log('✅ Supabase connection test completed');
    }, 2000);
    
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
  (window as any).supabaseConnection = supabaseConnection;
  (window as any).checkSupabaseHealth = checkSupabaseHealth;
} 