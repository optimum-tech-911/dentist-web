import { useEffect, useRef } from 'react';
// @ts-ignore
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Extend Window interface to include DOMPurify
declare global {
  interface Window {
    DOMPurify: typeof DOMPurify;
  }
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Handle empty content
    if (!content || content.trim() === '') {
      containerRef.current.innerHTML = '';
      return;
    }
    
    // Sanitize HTML content (from TipTap)
    let html = content || '';
    try {
      if (window.DOMPurify) {
        html = window.DOMPurify.sanitize(html, { 
          USE_PROFILES: { html: true },
          ADD_TAGS: ['video', 'iframe'], // Allow video and iframe tags
          ADD_ATTR: ['controls', 'autoplay', 'muted', 'loop', 'preload', 'frameborder', 'allowfullscreen'] // Allow video attributes
        });
      } else if (DOMPurify) {
        html = DOMPurify.sanitize(html, { 
          USE_PROFILES: { html: true },
          ADD_TAGS: ['video', 'iframe'],
          ADD_ATTR: ['controls', 'autoplay', 'muted', 'loop', 'preload', 'frameborder', 'allowfullscreen']
        });
      }
    } catch (error) {
      console.error('Error sanitizing content:', error);
      html = content; // Fallback to original content
    }
    
    containerRef.current.innerHTML = html;
    
    // Add responsive styling to YouTube and video embeds
    const youtubeEmbeds = containerRef.current.querySelectorAll('iframe');
    youtubeEmbeds.forEach((iframe) => {
      iframe.classList.add('w-full', 'aspect-video', 'rounded-lg', 'shadow-lg', 'my-6');
    });
    
    const videos = containerRef.current.querySelectorAll('video');
    videos.forEach((video) => {
      video.classList.add('w-full', 'max-w-3xl', 'aspect-video', 'rounded-xl', 'shadow-lg', 'my-6', 'mx-auto', 'bg-black');
      // Ensure videos have controls
      if (!video.hasAttribute('controls')) {
        video.setAttribute('controls', 'true');
      }
      // Ensure videos have proper attributes
      if (!video.hasAttribute('preload')) {
        video.setAttribute('preload', 'metadata');
      }
    });
    
    // Add styling to images
    const images = containerRef.current.querySelectorAll('img');
    images.forEach((img) => {
      img.classList.add('w-full', 'h-auto', 'rounded-lg', 'shadow-md', 'my-4');
    });
    
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`markdown-content prose max-w-none ${className}`}
    />
  );
} 