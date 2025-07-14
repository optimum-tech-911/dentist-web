import { useEffect, useRef } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Auto-embed YouTube URLs (even if pasted as plain text)
    let html = content.replace(
      /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})[^\s]*/g,
      (match, videoId) =>
        `<div class="youtube-embed my-6"><iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`
    );

    // 2. Convert Markdown video to <video> (must come before image)
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+\.(mp4|webm|ogg))\)/g,
      '<video src="$2" controls class="w-full rounded-lg my-4">$1</video>'
    );

    // 3. Convert Markdown images
    html = html.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />'
    );

    // 4. Basic Markdown formatting (headers, bold, italic, etc.)
    html = html
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />');

    // 5. Wrap in paragraph tags
    html = `<p class="mb-4">${html}</p>`;

    // 6. Fix list structure
    html = html.replace(/<li class="ml-4">(.*?)<\/li>/g, (match, content) => {
      return `<ul class="list-disc ml-6 mb-4"><li>${content}</li></ul>`;
    });

    // 7. Handle YouTube embeds (if already in embed code)
    html = html.replace(/<div class="youtube-embed">([\s\S]*?)<\/div>/g, (match, embedCode) => {
      return `<div class="youtube-embed my-6">${embedCode}</div>`;
    });

    containerRef.current.innerHTML = html;

    // 8. Add responsive styling to YouTube embeds
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