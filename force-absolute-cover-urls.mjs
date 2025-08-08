#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function toPublicUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const clean = path.replace(/^gallery\//, '').split('?')[0];
  const { data } = supabase.storage.from('gallery').getPublicUrl(clean);
  return data?.publicUrl || null;
}

async function run() {
  console.log('🔧 Converting posts.image to absolute public URLs...');
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, image')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Fetch error:', error);
    process.exit(1);
  }

  let updated = 0;
  for (const post of posts) {
    const current = post.image || '';
    const absolute = toPublicUrl(current);
    if (!absolute || absolute === current) continue;

    const { error: updErr } = await supabase
      .from('posts')
      .update({ image: absolute, updated_at: new Date().toISOString() })
      .eq('id', post.id);

    if (updErr) {
      console.error(`❌ Update failed for ${post.id} (${post.title}):`, updErr);
      continue;
    }
    updated += 1;
    console.log(`✅ ${post.title}: ${current} -> ${absolute}`);
  }

  console.log(`\n✅ Done. Updated: ${updated}`);
}

run().catch(e => { console.error('❌ Error:', e); process.exit(1); });