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
    containerRef.current.innerHTML = html;

    // Wrap all bare text nodes in <p> tags for robust rendering
    const container = containerRef.current;
    Array.from(container.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
        const p = document.createElement('p');
        p.textContent = node.textContent;
        container.replaceChild(p, node);
      }
    });

    // Add beautiful, modern styling to YouTube and video embeds
    const youtubeEmbeds = container.querySelectorAll('iframe');
    youtubeEmbeds.forEach((iframe) => {
      iframe.classList.add(
        'w-full',
        'aspect-video',
        'rounded-2xl',
        'shadow-xl',
        'my-8',
        'mx-auto',
        'border-4',
        'border-blue-200',
        'bg-black',
        'transition-all',
        'hover:scale-105',
        'duration-300'
      );
      iframe.setAttribute('style', 'display: block; max-width: 900px;');
    });

    const videos = container.querySelectorAll('video');
    videos.forEach((video) => {
      video.classList.add(
        'w-full',
        'max-w-3xl',
        'aspect-video',
        'rounded-2xl',
        'shadow-2xl',
        'my-8',
        'mx-auto',
        'bg-black',
        'border-4',
        'border-blue-200',
        'transition-all',
        'hover:scale-105',
        'duration-300'
      );
      video.setAttribute('style', 'display: block;');
    });
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`markdown-content ${className}`}
    />
  );
} 