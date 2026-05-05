import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Element } from 'hast';

export function rehypeExternalLinks(): Plugin<[], Root> {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a') {
        const href = node.properties?.href;
        if (typeof href === 'string' && 
            (href.startsWith('http://') || href.startsWith('https://'))) {
          node.properties = node.properties || {};
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
    });
  };
}
