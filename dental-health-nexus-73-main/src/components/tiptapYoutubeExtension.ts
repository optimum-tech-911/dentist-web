import { Node, mergeAttributes } from '@tiptap/core';

export const YoutubeNode = Node.create({
  name: 'youtubeNode',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      frameborder: { default: 0 },
      allowfullscreen: { default: true },
      class: { default: 'w-full aspect-video rounded-lg my-4' }
    }
  },

  parseHTML() {
    return [{ tag: 'iframe' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes)];
  }
}); 