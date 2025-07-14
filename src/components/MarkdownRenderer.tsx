import { useEffect, useRef } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert Markdown to HTML
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Video (must come before image)
      .replace(/!\[([^\]]*)\]\(([^)]+\.(mp4|webm|ogg))\)/g, '<video src="$2" controls class="w-full rounded-lg my-4">$1</video>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">$1</blockquote>')
      
      // Lists
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>')
      
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="mb-4">')
      
      // Line breaks
      .replace(/\n/g, '<br />');

    // Wrap in paragraph tags
    html = `<p class="mb-4">${html}</p>`;

    // Fix list structure
    html = html.replace(/<li class="ml-4">(.*?)<\/li>/g, (match, content) => {
      return `<ul class="list-disc ml-6 mb-4"><li>${content}</li></ul>`;
    });

    // Handle YouTube embeds
    html = html.replace(/<div class="youtube-embed">([\s\S]*?)<\/div>/g, (match, embedCode) => {
      return `<div class="youtube-embed my-6">${embedCode}</div>`;
    });

    containerRef.current.innerHTML = html;

    // Add responsive styling to YouTube embeds
    const youtubeEmbeds = containerRef.current.querySelectorAll('.youtube-embed iframe');
    youtubeEmbeds.forEach((iframe) => {
      iframe.classList.add('w-full', 'aspect-video', 'rounded-lg');
    });

  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`markdown-content ${className}`}
    />
  );
} 