import React, { useCallback, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Button } from '@/components/ui/button';
import { GallerySelector } from './GallerySelector';
import { Play, Image as ImageIcon, Bold as BoldIcon, Italic as ItalicIcon, List, ListOrdered, Quote, Underline as UnderlineIcon, Youtube as YoutubeIcon } from 'lucide-react';

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
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg my-4',
        },
      }),
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
        const iframeHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="w-full aspect-video rounded-lg my-4"></iframe>`;
        editor.commands.focus();
        editor.commands.insertContent(iframeHtml);
      } else {
        alert('URL YouTube invalide');
      }
    }
  }, [editor]);

  const setGalleryMedia = useCallback((media: any) => {
    if (!media) return;
    if (media.file_type && media.file_type.startsWith('video/')) {
      // Insert video as HTML
      if (editor) {
        const videoHtml = `<video src="${media.url}" controls preload="metadata" class="w-full max-w-3xl aspect-video rounded-xl shadow-lg my-6 mx-auto bg-black"></video>`;
        editor.commands.focus();
        editor.commands.insertContent(videoHtml);
      }
    } else {
      setImage(media.url);
    }
  }, [editor, setImage]);

  if (!editor) return <div className="p-4 text-center text-gray-400">Chargement de l’éditeur…</div>;

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
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}; 