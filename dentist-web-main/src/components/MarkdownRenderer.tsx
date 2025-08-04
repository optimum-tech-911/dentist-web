import { useEffect, useRef } from 'react';
// @ts-ignore
import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

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

// Helper function to convert signed URLs to public URLs
const convertSignedUrlsToPublic = async (html: string): Promise<string> => {
  if (!html) return html;
  
  // Find all img tags with gallery signed URLs
  const imgRegex = /<img[^>]+src="([^"]*\/storage\/v1\/object\/sign\/gallery\/[^"]*)"[^>]*>/g;
  let updatedHtml = html;
  let match;

  // Reset regex state
  imgRegex.lastIndex = 0;
  
  const urlsToReplace: { signed: string; public: string }[] = [];
  
  while ((match = imgRegex.exec(html)) !== null) {
    const signedUrl = match[1];
    try {
      // Extract file path from the signed URL
      const urlParts = signedUrl.split('/gallery/')[1]?.split('?')[0];
      if (urlParts) {
        // Convert to public URL
        const { data } = supabase.storage
          .from('gallery')
          .getPublicUrl(urlParts);
        
        if (data?.publicUrl) {
          urlsToReplace.push({ signed: signedUrl, public: data.publicUrl });
        }
      }
    } catch (error) {
      console.log('Could not convert signed URL to public URL:', error);
    }
  }
  
  // Replace all signed URLs with public URLs
  urlsToReplace.forEach(({ signed, public: publicUrl }) => {
    updatedHtml = updatedHtml.replace(new RegExp(signed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), publicUrl);
  });

  return updatedHtml;
};

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Handle empty content
    if (!content || content.trim() === '') {
      containerRef.current.innerHTML = '';
      return;
    }
    
    const processContent = async () => {
      // First convert any signed URLs to public URLs
      let html = await convertSignedUrlsToPublic(content);
      
      // Then sanitize HTML content (from TipTap)
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
      
      if (containerRef.current) {
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
        
        // Add styling to images and add error handling
        const images = containerRef.current.querySelectorAll('img');
        images.forEach((img) => {
          img.classList.add('w-full', 'h-auto', 'rounded-lg', 'shadow-md', 'my-4');
          
          // Add error handling for broken images
          img.addEventListener('error', () => {
            console.log('Image failed to load:', img.src);
            // You could set a placeholder image here if needed
          });
        });
      }
    };
    
    processContent();
    
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`markdown-content prose max-w-none ${className}`}
    />
  );
} 