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
    
    let html = content || '';
    
    // If content contains videos or iframes, bypass DOMPurify completely
    if (html.includes('<video') || html.includes('<iframe')) {
      // For video content, render directly without sanitization
      containerRef.current.innerHTML = html;
    } else {
      // For regular content, use DOMPurify
      const purifyConfig = {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'blockquote', 'a', 'img'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'style', 'width', 'height'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        ALLOW_DATA_ATTR: false,
        KEEP_CONTENT: true
      };
      html = DOMPurify.sanitize(html, purifyConfig);
      containerRef.current.innerHTML = html;
    }
    
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