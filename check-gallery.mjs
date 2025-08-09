#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function resolveImageUrl(imageUrl) {
  if (!imageUrl) return imageUrl;
  if (imageUrl.includes('/storage/v1/object/public/gallery/')) return imageUrl;

  if (imageUrl.includes('/storage/v1/object/sign/gallery/')) {
    const urlParts = imageUrl.split('/gallery/')[1]?.split('?')[0];
    if (urlParts) {
      const { data } = supabase.storage.from('gallery').getPublicUrl(urlParts);
      if (data?.publicUrl) return data.publicUrl;
    }
  }

  if (imageUrl.startsWith('gallery/') || imageUrl.startsWith('/gallery/')) {
    const pathInBucket = imageUrl.replace(/^\/?gallery\//, '');
    const { data } = supabase.storage.from('gallery').getPublicUrl(pathInBucket);
    if (data?.publicUrl) return data.publicUrl;
  }

  if (!imageUrl.includes('://') && !imageUrl.startsWith('/')) {
    const { data } = supabase.storage.from('gallery').getPublicUrl(imageUrl);
    if (data?.publicUrl) return data.publicUrl;
  }

  return imageUrl;
}

async function headOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Verifying blog cover images...');
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, image, status')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw error;

  for (const post of posts) {
    const resolved = await resolveImageUrl(post.image);
    const ok = resolved ? await headOk(resolved) : false;
    console.log(`- ${post.title}: ${post.image} -> ${resolved} ${ok ? '✅' : '❌'}`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});