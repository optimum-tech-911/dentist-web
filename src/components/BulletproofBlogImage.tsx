import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BulletproofBlogImageProps {
  src: string;
  alt: string;
  className?: string;
  title?: string;
  postId?: string;
}

export function BulletproofBlogImage({ src, alt, className = '', title = '', postId }: BulletproofBlogImageProps) {
  // Temporary simple version for debugging
  if (!src) {
    return null;
  }

  // Convert to public URL
  let imageUrl = src;
  if (!src.startsWith('http')) {
    let cleanPath = src;
    if (src.startsWith('gallery/')) {
      cleanPath = src.substring(8);
    }
    imageUrl = `https://cmcfeiskfdbsefzqywbk.supabase.co/storage/v1/object/public/gallery/${cleanPath}`;
  }

  console.log(`📷 Simple image render: "${title}" -> ${imageUrl}`);

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => console.log(`✅ Simple image loaded: ${title}`)}
        onError={(e) => console.error(`❌ Simple image failed: ${title}`, imageUrl, e)}
        loading="lazy"
      />
    </div>
  );
}