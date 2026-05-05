import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Element, Parent } from 'hast';

export function rehypeTableWrappers(): Plugin<[], Root> {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent: Parent) => {
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrapper'] },
          children: [node]
        };
        
        parent.children[index] = wrapper;
      }
    });
  };
}
