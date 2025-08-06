import React, { useCallback, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Video } from './tiptapVideoExtension';
import { YoutubeNode } from './tiptapYoutubeExtension';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Button } from '@/components/ui/button';
import { GallerySelector } from './GallerySelector';
import { TableBuilder } from './TableBuilder';
import { Play, Image as ImageIcon, Bold as BoldIcon, Italic as ItalicIcon, List, ListOrdered, Quote, Underline as UnderlineIcon, Youtube as YoutubeIcon, Table as TableIcon, PlusSquare, MinusSquare, Trash2, Merge, Split } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Helper function to ensure we always use public URLs
const ensurePublicUrl = (url: string): string => {
  // If it's already a public URL, return as-is
  if (url.includes('/storage/v1/object/public/gallery/')) {
    return url;
  }
  
  // If it's a signed URL, convert to public URL
  if (url.includes('/storage/v1/object/sign/gallery/')) {
    try {
      const urlParts = url.split('/gallery/')[1]?.split('?')[0];
      if (urlParts) {
        const { data } = supabase.storage
          .from('gallery')
          .getPublicUrl(urlParts);
        return data.publicUrl;
      }
    } catch (error) {
      console.log('Could not convert to public URL:', error);
    }
  }
  
  // Return original URL if not a gallery URL
  return url;
};

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ value, onChange, placeholder = "Rédigez votre contenu ici...", className = "" }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Link,
      Image,
      YoutubeNode, // Add the custom YouTube extension
      Video, // Custom video extension
      Table.configure({
        resizable: true,
        lastColumnResizable: true,
        HTMLAttributes: {
          class: 'tiptap-table w-full border-collapse rounded-lg overflow-hidden shadow-lg my-8',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'hover:bg-slate-100 transition-colors duration-200',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 px-6 py-4 text-left font-semibold text-slate-700 uppercase tracking-wide text-sm',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-slate-200 px-6 py-4 text-slate-700',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'min-h-[500px] p-6 outline-none prose prose-lg max-w-none bg-white rounded-xl border-2 border-slate-200 font-sans text-base leading-relaxed article-editor',
        placeholder,
      },
    },
  });

  // Keep editor in sync with value prop
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Toolbar actions
  const setImage = useCallback((url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setYoutube = useCallback(() => {
    const url = prompt('Collez l\'URL YouTube ici :');
    if (url && editor) {
      try {
        // Extract video ID from various YouTube URL formats
        const match = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const videoId = match ? match[1] : null;
        if (videoId) {
          const youtubeContent = {
            type: 'youtubeNode',
            attrs: {
              src: `https://www.youtube.com/embed/${videoId}`,
              frameborder: 0,
              allowfullscreen: true,
              class: 'w-full aspect-video rounded-lg my-4'
            }
          };
          editor.chain().focus().insertContent(youtubeContent).run();
        } else {
          alert('URL YouTube invalide. Veuillez utiliser un lien YouTube valide.');
        }
      } catch (error) {
        console.error('Error inserting YouTube video:', error);
        alert('Erreur lors de l\'insertion de la vidéo YouTube.');
      }
    }
  }, [editor]);

  const setGalleryMedia = useCallback((media: any) => {
    if (!media) return;
    
    try {
      // Always ensure we use public URLs to prevent expiry
      const publicUrl = ensurePublicUrl(media.url);
      
      if (media.file_type && media.file_type.startsWith('video/')) {
        if (editor) {
          const videoContent = {
            type: 'video',
            attrs: { 
              src: publicUrl,
              controls: true,
              preload: 'metadata'
            }
          };
          editor.chain().focus().insertContent(videoContent).run();
        }
      } else {
        setImage(publicUrl);
      }
    } catch (error) {
      console.error('Error inserting media:', error);
      // You could add a toast notification here if needed
    }
  }, [editor, setImage]);

  // Helper to check if inside a table
  const isInTable = editor?.isActive('table');

  // Handle table insertion from TableBuilder
  const handleInsertTable = useCallback((tableData: { rows: number; cols: number; headers: string[]; data: string[][] }) => {
    if (!editor) return;

    // Create table HTML with enhanced styling
    let tableHTML = '<div class="table-container my-6">';
    tableHTML += '<table class="tiptap-table w-full border-collapse rounded-lg overflow-hidden shadow-lg">';
    
    // Add header row with enhanced styling
    tableHTML += '<thead>';
    tableHTML += '<tr class="bg-gradient-to-r from-slate-50 to-slate-100">';
    tableData.headers.forEach((header, index) => {
      tableHTML += `<th class="border border-slate-200 px-6 py-4 text-left font-semibold text-slate-700 uppercase tracking-wide text-sm">${header}</th>`;
    });
    tableHTML += '</tr>';
    tableHTML += '</thead>';
    
    // Add data rows with alternating colors and proper borders
    tableHTML += '<tbody>';
    tableData.data.forEach((row, rowIndex) => {
      const rowClass = rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50';
      tableHTML += `<tr class="${rowClass} hover:bg-slate-100 transition-colors duration-200">`;
      row.forEach((cell, colIndex) => {
        tableHTML += `<td class="border border-slate-200 px-6 py-4 text-slate-700">${cell}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    tableHTML += '</div>';

    // Insert the table
    editor.chain().focus().insertContent(tableHTML).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-400">Chargement de l'éditeur…</p>
        <p className="text-xs text-gray-300 mt-2">Si le chargement persiste, actualisez la page</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg border mb-2">
        <Button type="button" variant={editor.isActive('bold') ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBold().run()} title="Gras (Ctrl+B)" className="h-8 w-8 p-0"><BoldIcon className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('italic') ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique (Ctrl+I)" className="h-8 w-8 p-0"><ItalicIcon className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('underline') ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} title="Souligné (Ctrl+U)" className="h-8 w-8 p-0"><UnderlineIcon className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('blockquote') ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation" className="h-8 w-8 p-0"><Quote className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('bulletList') ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces" className="h-8 w-8 p-0"><List className="h-4 w-4" /></Button>
        <Button type="button" variant={editor.isActive('orderedList') ? 'default' : 'ghost'} size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée" className="h-8 w-8 p-0"><ListOrdered className="h-4 w-4" /></Button>
        <GallerySelector
          onImageSelect={setGalleryMedia}
          trigger={<Button type="button" variant="ghost" size="sm" className="h-8 gap-1"><ImageIcon className="h-4 w-4" /><span className="hidden sm:inline">Image</span></Button>}
          title="Insérer une image ou vidéo de la galerie"
          description="Choisissez une image ou une vidéo depuis la galerie pour l'insérer dans votre article"
        />
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1" onClick={setYoutube} title="Insérer une vidéo YouTube"><YoutubeIcon className="h-4 w-4" /><span className="hidden sm:inline">YouTube</span></Button>
        
        {/* Enhanced Table Builder */}
        <TableBuilder
          onInsertTable={handleInsertTable}
          trigger={
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1" title="Créer un tableau personnalisé">
              <TableIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau</span>
            </Button>
          }
        />
        
        {/* Table editing controls (only show when inside a table) */}
        {isInTable && (
          <>
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Ajouter une colonne à droite">
              <PlusSquare className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1" onClick={() => editor.chain().focus().addRowAfter().run()} title="Ajouter une ligne en dessous">
              <PlusSquare className="h-4 w-4 rotate-90" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1" onClick={() => editor.chain().focus().deleteTable().run()} title="Supprimer le tableau">
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}; 