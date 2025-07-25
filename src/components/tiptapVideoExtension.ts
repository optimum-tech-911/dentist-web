import { Node, mergeAttributes } from '@tiptap/core';

export const Video = Node.create({
  name: 'video',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      autoplay: { default: false },
      muted: { default: false },
      loop: { default: false },
      preload: { default: 'metadata' },
      class: { default: 'w-full max-w-3xl aspect-video rounded-xl shadow-lg my-6 mx-auto bg-black' }
    }
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  renderHTML({ HTMLAttributes }) {
    // Ensure we have all necessary attributes for proper video rendering
    const attrs = {
      ...HTMLAttributes,
      controls: HTMLAttributes.controls !== false ? 'controls' : undefined,
      preload: HTMLAttributes.preload || 'metadata',
      class: HTMLAttributes.class || 'w-full max-w-3xl aspect-video rounded-xl shadow-lg my-6 mx-auto bg-black'
    };
    
    return ['video', mergeAttributes(attrs)];
  }
}); 