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
    // Ensure we have all necessary attributes for proper iframe rendering
    const attrs = {
      ...HTMLAttributes,
      frameborder: HTMLAttributes.frameborder || 0,
      allowfullscreen: HTMLAttributes.allowfullscreen !== false ? 'allowfullscreen' : undefined,
      class: HTMLAttributes.class || 'w-full aspect-video rounded-lg my-4'
    };
    
    return ['iframe', mergeAttributes(attrs)];
  }
}); 