#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Check environment variables
console.log('🔍 CHECKING ENVIRONMENT VARIABLES...');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY || 'NOT SET');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'NOT SET');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY || 'NOT SET');

// Try different possible configurations
const configs = [
  {
    name: 'Hardcoded config (from client.ts)',
    url: 'https://cmcfeiskfdbsefzqywbk.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU'
  },
  {
    name: 'Environment VITE_SUPABASE_URL',
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY
  },
  {
    name: 'Environment SUPABASE_URL',
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY
  }
];

async function testConfigs() {
  for (const config of configs) {
    if (!config.url || !config.key) {
      console.log(`\n❌ ${config.name}: Missing URL or key`);
      continue;
    }
    
    console.log(`\n🧪 Testing ${config.name}...`);
    console.log(`URL: ${config.url}`);
    console.log(`Key: ${config.key.substring(0, 20)}...`);
    
    try {
      const supabase = createClient(config.url, config.key);
      
      // Test the connection
      const { data, error } = await supabase
        .from('posts')
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${config.name}: Connection failed - ${error.message}`);
      } else {
        console.log(`✅ ${config.name}: Connection successful`);
        
        // Check posts
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'pending');
        
        if (postsError) {
          console.log(`❌ ${config.name}: Posts query failed - ${postsError.message}`);
        } else {
          console.log(`✅ ${config.name}: Found ${posts.length} pending posts`);
          posts.forEach((post, index) => {
            console.log(`  ${index + 1}. "${post.title}" (${post.id})`);
          });
        }
      }
    } catch (error) {
      console.log(`❌ ${config.name}: Error - ${error.message}`);
    }
  }
}

testConfigs();