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
      
      // Add error handling for images
      img.onerror = (e) => {
        const target = e.target as HTMLImageElement;
        console.error('Markdown image failed to load:', target.src);
        target.style.display = 'none';
        // Show a placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center my-4';
        placeholder.innerHTML = `
          <div class="text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p class="text-sm">Image non disponible</p>
          </div>
        `;
        target.parentNode?.insertBefore(placeholder, target);
      };
      
      // Add load success logging
      img.onload = () => {
        console.log('Markdown image loaded successfully:', img.src);
      };
    });
    
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`markdown-content prose max-w-none ${className}`}
    />
  );
} 