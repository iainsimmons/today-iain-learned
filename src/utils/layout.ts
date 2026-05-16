
/**
 * Shared layout utilities to consolidate logic across PostLayout and PageLayout
 */
import { siteConfig } from '@/config';

/**
 * Initialize layout-specific scripts for posts and pages
 */
export function initializeLayout() {
  document.addEventListener('DOMContentLoaded', function() {
    // Process all external links in content to open in new tabs
    const allLinks = document.querySelectorAll('.prose a[href]');
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        if (!link.hasAttribute('target')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });

    // Wrap tables in responsive containers
    const tables = document.querySelectorAll('.prose table');
    tables.forEach((table) => {
      if (table.parentElement && !table.parentElement.classList.contains('table-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        if (table.parentNode) {
          table.parentNode.insertBefore(wrapper, table);
        }
        wrapper.appendChild(table);
        table.style.margin = '0';
      }
    });
  });
}
