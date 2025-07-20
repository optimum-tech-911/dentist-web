import { useEffect, useRef } from 'react';
// @ts-ignore
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Sanitize HTML content (from TipTap)
    let html = content || '';
    if (window.DOMPurify) {
      html = window.DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    } else if (DOMPurify) {
      html = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    }
    containerRef.current.innerHTML = html;
    // Add responsive styling to YouTube and video embeds
    const youtubeEmbeds = containerRef.current.querySelectorAll('iframe');
    youtubeEmbeds.forEach((iframe) => {
      iframe.classList.add('w-full', 'aspect-video', 'rounded-lg');
    });
    const videos = containerRef.current.querySelectorAll('video');
    videos.forEach((video) => {
      video.classList.add('w-full', 'max-w-3xl', 'aspect-video', 'rounded-xl', 'shadow-lg', 'my-6', 'mx-auto', 'bg-black');
    });
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`markdown-content ${className}`}
    />
  );
} 