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
import { Play, Image as ImageIcon, Bold as BoldIcon, Italic as ItalicIcon, List, ListOrdered, Quote, Underline as UnderlineIcon, Youtube as YoutubeIcon, Table as TableIcon, PlusSquare, MinusSquare, Trash2, Merge, Split } from 'lucide-react';
import { useState } from 'react';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ value, onChange, placeholder = "Rédigez votre contenu ici...", className = "" }) => {
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
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
          class: 'tiptap-table w-full border border-gray-300 rounded-lg overflow-hidden',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[400px] p-4 outline-none prose prose-blue max-w-none bg-white rounded-lg border font-sans text-base',
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
    const url = prompt('Collez l’URL YouTube ici :');
    if (url && editor) {
      // Extract video ID from various YouTube URL formats
      const match = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      const videoId = match ? match[1] : null;
      if (videoId) {
        editor.chain().focus().insertContent({
          type: 'youtubeNode',
          attrs: {
            src: `https://www.youtube.com/embed/${videoId}`,
            frameborder: 0,
            allowfullscreen: true,
            class: 'w-full aspect-video rounded-lg my-4'
          }
        }).run();
      } else {
        alert('URL YouTube invalide');
      }
    }
  }, [editor]);

  const setGalleryMedia = useCallback((media: any) => {
    if (!media) return;
    if (media.file_type && media.file_type.startsWith('video/')) {
      if (editor) {
        editor.chain().focus().insertContent({
          type: 'video',
          attrs: { src: media.url }
        }).run();
      }
    } else {
      setImage(media.url);
    }
  }, [editor, setImage]);

  // Helper to check if inside a table
  const isInTable = editor?.isActive('table');

  // Table Insert Dialog
  const TableInsertDialog = () => (
    showTableDialog ? (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
        <div className="bg-white rounded-lg shadow-lg p-6 w-80 space-y-4">
          <h2 className="text-lg font-bold mb-2">Insérer un tableau</h2>
          <div className="flex items-center gap-2">
            <label>Colonnes:</label>
            <input type="number" min={1} max={10} value={tableCols} onChange={e => setTableCols(Number(e.target.value))} className="border rounded px-2 w-16" />
            <label>Lignes:</label>
            <input type="number" min={1} max={20} value={tableRows} onChange={e => setTableRows(Number(e.target.value))} className="border rounded px-2 w-16" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>Annuler</Button>
            <Button onClick={() => {
              editor?.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
              setShowTableDialog(false);
            }}>Insérer</Button>
          </div>
        </div>
      </div>
    ) : null
  );

  if (!editor) return <div className="p-4 text-center text-gray-400">Chargement de l’éditeur…</div>;

  return (
    <div className={`space-y-2 ${className}`}>
      <TableInsertDialog />
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
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setShowTableDialog(true)} title="Insérer un tableau">
          <TableIcon className="h-4 w-4" />
        </Button>
        {isInTable && <>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Ajouter une colonne à droite">
            <PlusSquare className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1" onClick={() => editor.chain().focus().addRowAfter().run()} title="Ajouter une ligne en dessous">
            <PlusSquare className="h-4 w-4 rotate-90" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 gap-1" onClick={() => editor.chain().focus().deleteTable().run()} title="Supprimer le tableau">
            <Trash2 className="h-4 w-4" />
          </Button>
        </>}
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}; 