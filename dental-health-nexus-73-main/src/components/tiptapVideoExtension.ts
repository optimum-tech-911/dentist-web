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
      class: { default: 'w-full max-w-3xl aspect-video rounded-xl shadow-lg my-6 mx-auto bg-black' }
    }
  },

  parseHTML() {
    return [{ tag: 'video' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes)];
  }
}); 