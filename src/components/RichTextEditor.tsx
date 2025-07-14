import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Play, Type, Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { GallerySelector } from './GallerySelector';
import { YouTubeEmbed } from './YouTubeEmbed';
import { GalleryService, type GalleryImage } from '@/lib/gallery';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onVideoEmbedChange?: (embedCode: string | null) => void;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Rédigez votre contenu ici...",
  className = "",
  onVideoEmbedChange
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [videoAdded, setVideoAdded] = useState(false);

  // Track cursor position
  const handleTextareaSelect = () => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  };

  // Insert text at cursor position
  const insertAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;

    const before = value.substring(0, selectionStart);
    const after = value.substring(selectionEnd);
    const newValue = before + textToInsert + after;
    
    onChange(newValue);
    
    // Set cursor position after inserted text
    const newCursorPos = selectionStart + textToInsert.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Formatting functions
  const formatText = (format: string) => {
    const selectedText = value.substring(selectionStart, selectionEnd);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'bullet':
        formattedText = `- ${selectedText}`;
        break;
      case 'numbered':
        formattedText = `1. ${selectedText}`;
        break;
      default:
        return;
    }

    insertAtCursor(formattedText);
  };

  // Handle image or video selection from gallery
  const handleImageSelect = (media: GalleryImage | string) => {
    if (typeof media === 'string') {
      insertAtCursor(media);
    } else {
      const imageMarkdown = `![${media.name}](${media.url})`;
      insertAtCursor(imageMarkdown);
    }
  };

  // Handle YouTube video selection
  const handleVideoSelect = (embedCode: string, videoUrl: string) => {
    setVideoAdded(true);
    if (onVideoEmbedChange) {
      onVideoEmbedChange(embedCode);
    }
    // Do NOT insert embed code into textarea
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Gras',
      onClick: () => formatText('bold'),
      disabled: selectionStart === selectionEnd
    },
    {
      icon: Italic,
      label: 'Italique',
      onClick: () => formatText('italic'),
      disabled: selectionStart === selectionEnd
    },
    {
      icon: Quote,
      label: 'Citation',
      onClick: () => formatText('quote'),
      disabled: selectionStart === selectionEnd
    },
    {
      icon: List,
      label: 'Liste à puces',
      onClick: () => formatText('bullet'),
      disabled: selectionStart === selectionEnd
    },
    {
      icon: ListOrdered,
      label: 'Liste numérotée',
      onClick: () => formatText('numbered'),
      disabled: selectionStart === selectionEnd
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border">
        {/* Text formatting */}
        <div className="flex items-center gap-1">
          {toolbarButtons.map((button) => (
            <Button
              key={button.label}
              variant="ghost"
              size="sm"
              onClick={button.onClick}
              disabled={button.disabled}
              title={button.label}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div className="w-px h-6 bg-border mx-2" />

        {/* Media insertion */}
        <div className="flex items-center gap-2">
          <GallerySelector
            onImageSelect={handleImageSelect}
            trigger={
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Image</span>
              </Button>
            }
            title="Insérer une image"
            description="Choisissez une image depuis la galerie pour l'insérer dans votre article"
          />
          <YouTubeEmbed
            onVideoSelect={handleVideoSelect}
            trigger={
              <Button variant="ghost" size="sm" className={`h-8 gap-1 ${videoAdded ? 'bg-green-100 text-green-700' : ''}`}> 
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Vidéo</span>
                {videoAdded && <span className="ml-1 text-green-600">✔️</span>}
              </Button>
            }
          />
        </div>
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleTextareaSelect}
        placeholder={placeholder}
        className="min-h-[400px] font-mono text-sm"
      />

      {/* Show video added message */}
      {videoAdded && (
        <div className="text-green-700 flex items-center gap-2 mt-2">
          <Play className="h-4 w-4" />
          <span>Vidéo ajoutée</span>
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-2">Formatage Markdown supporté :</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div><strong>**gras**</strong> pour le texte en gras</div>
          <div><em>*italique*</em> pour le texte en italique</div>
          <div><code>&gt; citation</code> pour les citations</div>
          <div><code>- liste</code> pour les listes à puces</div>
        </div>
      </div>
    </div>
  );
} 