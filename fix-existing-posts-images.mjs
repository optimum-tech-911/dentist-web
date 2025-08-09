#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cmcfeiskfdbsefzqywbk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTAwMzIsImV4cCI6MjA2NzY2NjAzMn0.xVUK-YzeIWDMmunYQj86hAsWja6nh_iDAVs2ViAspjU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizeImagePath(value) {
  if (!value) return null;
  let v = value.trim();
  // Strip query params
  v = v.split('?')[0];

  // If contains '/gallery/', take substring after it
  if (v.includes('/gallery/')) {
    const after = v.split('/gallery/')[1];
    return after ? `gallery/${after}` : null;
  }

  // If signed/public URL variants
  if (v.includes('/object/sign/gallery/')) {
    const after = v.split('/object/sign/gallery/')[1];
    return after ? `gallery/${after}` : null;
  }
  if (v.includes('/object/public/gallery/')) {
    const after = v.split('/object/public/gallery/')[1];
    return after ? `gallery/${after}` : null;
  }

  // If already starts with gallery/
  if (v.startsWith('gallery/')) {
    return v;
  }

  // If it's a plain storage file key like '<uuid>/filename.png'
  if (!v.startsWith('http')) {
    // Assume it belongs to gallery bucket
    return `gallery/${v}`;
  }

  // Otherwise leave as-is
  return v;
}

async function run() {
  console.log('🔧 Normalizing existing posts.image values to gallery/<path>...');
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, image, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('❌ Failed to fetch posts:', error);
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;
  const changes = [];

  for (const post of posts) {
    const current = post.image || '';
    const normalized = normalizeImagePath(current);

    if (!normalized || normalized === current) {
      skipped += 1;
      continue;
    }

    const { error: updErr } = await supabase
      .from('posts')
      .update({ image: normalized, updated_at: new Date().toISOString() })
      .eq('id', post.id);

    if (updErr) {
      console.error(`❌ Update failed for ${post.id} (${post.title}):`, updErr);
      continue;
    }

    updated += 1;
    changes.push({ id: post.id, title: post.title, from: current, to: normalized });
  }

  console.log(`\n✅ Done. Updated: ${updated}, Skipped (no change): ${skipped}`);
  if (changes.length) {
    console.log('\n📋 Changes:');
    for (const c of changes) {
      console.log(`- ${c.id} | ${c.title}`);
      console.log(`  ${c.from} -> ${c.to}`);
    }
  }
}

run().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});