import type { Post, WikilinkMatch } from "@/types";

// Global posts cache for build-time wikilink resolution
let globalPostsCache: any[] = [];

// Function to set the global posts cache
export function setGlobalPostsCache(posts: any[]) {
  globalPostsCache = posts;
}

// Function to get the global posts cache
export function getGlobalPostsCache(): any[] {
  return globalPostsCache;
}

// Function to populate the global posts cache (called from layouts)
export function populateGlobalPostsCache(posts: any[]) {
  globalPostsCache = posts;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Utility functions for content-aware URL processing
function isFolderBasedContent(
  collection: "posts" | "pages",
  slug: string,
  allContent: any[],
): boolean {
  const content = allContent.find((item) => item.id === slug);
  return content ? content.id.endsWith("/index") : false;
}

function shouldRemoveIndexFromUrl(
  url: string,
  allPosts: any[],
  allPages: any[],
): boolean {
  // Determine collection type from URL
  if (url.startsWith("/posts/")) {
    const slug = url.replace("/posts/", "").split("#")[0]; // Remove anchor
    return isFolderBasedContent("posts", slug, allPosts);
  } else if (url.startsWith("/pages/")) {
    const slug = url.replace("/pages/", "").split("#")[0]; // Remove anchor
    return isFolderBasedContent("pages", slug, allPages);
  }
  return false; // Don't remove /index for other URLs
}

// Create slug from title for wikilink resolution
function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Decode URL-encoded anchor text (for Obsidian compatibility)
// Handles %20 (space), %23 (#), and other URL-encoded characters
function decodeAnchorText(encodedText: string): string {
  try {
    // Decode URL-encoded characters (e.g., %20 -> space, %23 -> #)
    return decodeURIComponent(encodedText);
  } catch (error) {
    // If decoding fails (invalid encoding), return original text
    // This handles edge cases like double encoding or malformed sequences
    return encodedText;
  }
}

// Create anchor slug from text (for heading anchors)
// Expects decoded text (spaces, not %20)
function createAnchorSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Parse link with potential anchor fragment
// Returns decoded anchor text for proper slugification
function parseLinkWithAnchor(linkText: string): {
  link: string;
  anchor: string | null;
} {
  const anchorIndex = linkText.indexOf("#");
  if (anchorIndex === -1) {
    return { link: linkText, anchor: null };
  }

  const link = linkText.substring(0, anchorIndex);
  const anchor = linkText.substring(anchorIndex + 1);

  // Decode URL-encoded anchor text (e.g., %20 -> space)
  // This ensures both "#Choose Your Workflow" and "#Choose%20Your%20Workflow" produce the same slug
  const decodedAnchor = anchor ? decodeAnchorText(anchor) : null;

  return { link, anchor: decodedAnchor };
}

// Helper function to check if a wikilink is inside backticks in raw content
function isWikilinkInCode(content: string, wikilinkIndex: number): boolean {
  // First check for code blocks (triple backticks)
  const codeBlockRegex = /```[\s\S]*?```/g;
  let codeBlockMatch;

  while ((codeBlockMatch = codeBlockRegex.exec(content)) !== null) {
    const codeBlockStart = codeBlockMatch.index;
    const codeBlockEnd = codeBlockMatch.index + codeBlockMatch[0].length;

    // Check if the wikilink is inside this code block
    if (wikilinkIndex >= codeBlockStart && wikilinkIndex < codeBlockEnd) {
      return true;
    }
  }

  // Then check for inline code (single backticks)
  const backtickRegex = /`([^`]*)`/g;
  let match;

  while ((match = backtickRegex.exec(content)) !== null) {
    const codeStart = match.index;
    const codeEnd = match.index + match[0].length;

    // Check if the wikilink is inside this code block
    if (wikilinkIndex >= codeStart && wikilinkIndex < codeEnd) {
      return true;
    }
  }

  return false;
}

// Helper function to check if a URL is an internal link
function isInternalLink(url: string): boolean {
  // Remove any leading/trailing whitespace
  url = url.trim();

  // Skip external URLs (http/https)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return false;
  }

  // Skip email links
  if (url.startsWith("mailto:")) {
    return false;
  }

  // Skip anchors only
  if (url.startsWith("#")) {
    return false;
  }

  // Parse anchor if present to check the base URL
  const { link } = parseLinkWithAnchor(url);

  // Check if it's an internal link:
  // - Ends with .md (markdown files)
  // - Starts with /posts/, /pages/, /projects/, /docs/, /special/ (relative URLs)
  // - Starts with posts/, pages/, projects/, docs/, special/ (relative paths)
  // - Is just a slug (no slashes) - assumes posts for backward compatibility
  const isInternal =
    link.endsWith(".md") ||
    link.startsWith("/posts/") ||
    link.startsWith("/pages/") ||
    link.startsWith("/projects/") ||
    link.startsWith("/docs/") ||
    link.startsWith("/special/") ||
    link.startsWith("posts/") ||
    link.startsWith("pages/") ||
    link.startsWith("projects/") ||
    link.startsWith("docs/") ||
    link.startsWith("special/") ||
    !link.includes("/");

  return isInternal;
}

// Helper function to map relative URLs to their actual site URLs
function mapRelativeUrlToSiteUrl(url: string): string {
  // Handle special case: /index/ or /index -> homepage
  if (url === "/index/" || url === "/index") {
    return "/";
  }

  // Handle special pages mapping
  if (url.startsWith("/special/")) {
    const specialPath = url.replace("/special/", "");
    if (specialPath === "home") {
      return "/"; // Homepage
    } else if (specialPath === "404") {
      return "/404"; // 404 page
    } else if (specialPath === "projects") {
      return "/projects"; // Projects index
    } else if (specialPath === "docs") {
      return "/docs"; // Docs index
    } else {
      // Other special pages - use normal page routing
      return `/${specialPath}`;
    }
  }

  // Handle pages mapping - remove /pages prefix
  if (url.startsWith("/pages/")) {
    const pagePath = url.replace("/pages/", "");
    return `/${pagePath}`;
  }

  // Handle special/ prefixed links (without leading slash)
  if (url.startsWith("special/")) {
    const specialPath = url.replace("special/", "");
    if (specialPath === "home") {
      return "/"; // Homepage
    } else if (specialPath === "404") {
      return "/404"; // 404 page
    } else if (specialPath === "projects") {
      return "/projects"; // Projects index
    } else if (specialPath === "docs") {
      return "/docs"; // Docs index
    } else {
      // Other special pages - use normal page routing
      return `/${specialPath}`;
    }
  }

  // Handle pages/ prefixed links (without leading slash)
  if (url.startsWith("pages/")) {
    const pagePath = url.replace("pages/", "");
    return `/${pagePath}`;
  }

  // For all other URLs, return as-is
  return url;
}

// Helper function to extract link text and anchor from URL for internal links
function extractLinkTextFromUrlWithAnchor(
  url: string,
  allPosts: any[] = [],
  allPages: any[] = [],
): { linkText: string | null; anchor: string | null } {
  url = url.trim();

  // Parse anchor if present
  const { link, anchor } = parseLinkWithAnchor(url);

  // Handle posts/ prefixed links first
  if (link.startsWith("posts/")) {
    let linkText = link.replace("posts/", "").replace(/\.md$/, "");
    // Conservative approach: only remove /index if it follows folder-based pattern
    if (linkText.endsWith("/index") && linkText.split("/").length === 2) {
      linkText = linkText.replace("/index", "");
    }
    return {
      linkText: linkText,
      anchor: anchor,
    };
  }

  // Handle /posts/ URLs (relative links)
  if (link.startsWith("/posts/")) {
    let linkText = link.replace("/posts/", "").replace(/\.md$/, "");
    // Conservative approach: only remove /index if it follows folder-based pattern
    if (linkText.endsWith("/index") && linkText.split("/").length === 2) {
      linkText = linkText.replace("/index", "");
    }
    return {
      linkText: linkText,
      anchor: anchor,
    };
  }

  // Handle special pages first
  if (link.startsWith("special/")) {
    const specialPath = link.replace("special/", "").replace(/\.md$/, "");
    if (specialPath === "home") {
      return {
        linkText: "homepage", // Special marker for homepage
        anchor: anchor,
      };
    } else if (specialPath === "404") {
      return {
        linkText: "404", // Special marker for 404 page
        anchor: anchor,
      };
    } else {
      return {
        linkText: specialPath,
        anchor: anchor,
      };
    }
  }

  // Handle /special/ URLs
  if (link.startsWith("/special/")) {
    const specialPath = link.replace("/special/", "");
    if (specialPath === "home") {
      return {
        linkText: "homepage", // Special marker for homepage
        anchor: anchor,
      };
    } else if (specialPath === "404") {
      return {
        linkText: "404", // Special marker for 404 page
        anchor: anchor,
      };
    } else {
      return {
        linkText: specialPath,
        anchor: anchor,
      };
    }
  }

  // Handle /pages/ URLs (relative links)
  if (link.startsWith("/pages/")) {
    let linkText = link.replace("/pages/", "").replace(/\.md$/, "");
    if (linkText.endsWith("/index")) {
      linkText = linkText.replace("/index", "");
    }
    return {
      linkText: linkText === "" ? "homepage" : linkText, // Special case for /pages/index -> homepage
      anchor: anchor,
    };
  }

  // Handle pages/ prefixed links (without leading slash)
  if (link.startsWith("pages/")) {
    let linkText = link.replace("pages/", "").replace(/\.md$/, "");
    if (linkText.endsWith("/index")) {
      linkText = linkText.replace("/index", "");
    }
    return {
      linkText: linkText === "" ? "homepage" : linkText, // Special case for pages/index -> homepage
      anchor: anchor,
    };
  }

  // Handle .md files - these should be treated as post references
  if (link.endsWith(".md")) {
    let linkText = link.replace(/\.md$/, "");
    // Conservative approach: only remove /index if it follows folder-based pattern
    // Pattern: folder-name/index -> folder-name (where folder-name matches the slug)
    if (linkText.endsWith("/index") && linkText.split("/").length === 2) {
      linkText = linkText.replace("/index", "");
    }
    return {
      linkText: linkText,
      anchor: anchor,
    };
  }

  // If it's just a slug (no slashes), use it directly
  if (!link.includes("/")) {
    return {
      linkText: link,
      anchor: anchor,
    };
  }

  return { linkText: null, anchor: null };
}

// Extract wikilinks from content (Obsidian-style)
export function extractWikilinks(content: string): WikilinkMatch[] {
  const matches: WikilinkMatch[] = [];

  // Extract wikilinks [[...]] and image wikilinks ![[...]]
  const wikilinkRegex = /!?\[\[([^\]]+)\]\]/g;
  let wikilinkMatch;

  while ((wikilinkMatch = wikilinkRegex.exec(content)) !== null) {
    const [fullMatch, linkContent] = wikilinkMatch;
    const isImageWikilink = fullMatch.startsWith("!");

    // Skip if wikilink is inside backticks (code)
    if (isWikilinkInCode(content, wikilinkMatch.index)) {
      continue;
    }

    // Only process link wikilinks for linked mentions, not image wikilinks
    if (!isImageWikilink) {
      const [link, displayText] = linkContent.includes("|")
        ? linkContent.split("|", 2)
        : [linkContent, linkContent];

      // Parse anchor if present
      const { link: baseLink } = parseLinkWithAnchor(link.trim());

      // Skip same-page anchors ([[#heading]]) - they don't reference other posts
      if (link.trim().startsWith("#") || baseLink === "") {
        continue;
      }

      // Create proper slug for linked mentions
      let slug = baseLink;
      if (baseLink.startsWith("posts/")) {
        const postPath = baseLink.replace("posts/", "");
        // Conservative approach: only remove /index if it follows folder-based pattern
        if (postPath.endsWith("/index") && postPath.split("/").length === 2) {
          slug = postPath.replace("/index", "");
        } else {
          slug = postPath;
        }
      } else if (baseLink.includes("/")) {
        // Handle folder-based post format: folder-name/index
        // In Astro v6, folder-based posts have IDs like 'folder-name' (not 'folder-name/index')
        if (baseLink.endsWith("/index") && baseLink.split("/").length === 2) {
          // This is a folder-based post: folder-name/index -> folder-name
          slug = baseLink.replace("/index", "");
        }
        // If it's some other path format, keep as-is for slug conversion
      }

      // Convert to slug format
      const finalSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

      matches.push({
        link: baseLink,
        display: displayText.trim(),
        slug: finalSlug,
      });
    }
  }

  return matches;
}

// Resolve wikilink to actual post (posts only)
export function resolveWikilink(posts: Post[], linkText: string): Post | null {
  const targetSlug = createSlugFromTitle(linkText);

  // First try exact id match
  let post = posts.find((p) => p.id === targetSlug);

  // If not found, try title match
  if (!post) {
    post = posts.find((p) => createSlugFromTitle(p.data.title) === targetSlug);
  }

  return post || null;
}

// Validate wikilinks in content (posts only)
export function validateWikilinks(
  posts: Post[],
  content: string,
): {
  valid: WikilinkMatch[];
  invalid: WikilinkMatch[];
} {
  const wikilinks = extractWikilinks(content);
  const valid: WikilinkMatch[] = [];
  const invalid: WikilinkMatch[] = [];

  wikilinks.forEach((wikilink) => {
    const resolved = resolveWikilink(posts, wikilink.link);
    if (resolved) {
      valid.push(wikilink);
    } else {
      invalid.push(wikilink);
    }
  });

  return { valid, invalid };
}

// Extract standard markdown links from content (all content types)
export function extractStandardLinks(content: string): WikilinkMatch[] {
  const matches: WikilinkMatch[] = [];

  // Extract standard markdown links [text](url) that point to internal content
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let markdownMatch;

  while ((markdownMatch = markdownLinkRegex.exec(content)) !== null) {
    const [fullMatch, displayText, url] = markdownMatch;

    // Skip if markdown link is inside backticks (code)
    if (isWikilinkInCode(content, markdownMatch.index)) {
      continue;
    }

    // Check if this is an internal link (relative path or pointing to any content)
    if (isInternalLink(url)) {
      const { linkText } = extractLinkTextFromUrlWithAnchor(url);
      if (linkText) {
        // Only include posts in linked mentions - this includes:
        // - posts/ prefixed links
        // - /posts/ relative links
        // - .md files (assumed to be posts)
        // - Simple slugs (assumed to be posts for backward compatibility)
        const isPostLink =
          linkText.startsWith("posts/") ||
          url.startsWith("/posts/") ||
          url.startsWith("posts/") ||
          url.endsWith(".md") ||
          (!linkText.includes("/") && !url.startsWith("/"));

        if (isPostLink) {
          // Create proper slug for linked mentions
          let slug = linkText;
          if (linkText.startsWith("posts/")) {
            const postPath = linkText.replace("posts/", "");
            // Conservative approach: only remove /index if it follows folder-based pattern
            if (
              postPath.endsWith("/index") &&
              postPath.split("/").length === 2
            ) {
              slug = postPath.replace("/index", "");
            } else {
              slug = postPath;
            }
          } else if (linkText.includes("/")) {
            // Handle folder-based post format: folder-name/index
            // In Astro v6, folder-based posts have IDs like 'folder-name' (not 'folder-name/index')
            if (
              linkText.endsWith("/index") &&
              linkText.split("/").length === 2
            ) {
              // This is a folder-based post: folder-name/index -> folder-name
              slug = linkText.replace("/index", "");
            }
            // If it's some other path format, keep as-is for slug conversion
          }

          // Convert to slug format
          const finalSlug = slug
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");

          matches.push({
            link: linkText,
            display: displayText.trim(),
            slug: finalSlug,
          });
        }
        // Note: Other content types (pages, projects, docs) are processed for URL conversion
        // but not included in linked mentions since linked mentions only work with posts
      }
    }
  }

  return matches;
}

// Extract all internal links (both wikilinks and standard links)
export function extractAllInternalLinks(content: string): WikilinkMatch[] {
  const wikilinks = extractWikilinks(content);
  const standardLinks = extractStandardLinks(content);

  // Combine and deduplicate
  const allLinks = [...wikilinks, ...standardLinks];
  const uniqueLinks = allLinks.filter(
    (link, index, self) =>
      index === self.findIndex((l) => l.slug === link.slug),
  );

  return uniqueLinks;
}

// ============================================================================
// LINKED MENTIONS (POSTS ONLY)
// ============================================================================

/**
 * LINKED MENTIONS: Find which posts reference a target post
 *
 * IMPORTANT: Linked mentions only work with posts collection
 * This is because wikilinks only work with posts, and linked mentions
 * are primarily designed for the Obsidian workflow where posts are the main content.
 */

// Find linked mentions (backlinks) for a post
export function findLinkedMentions(
  posts: Post[],
  targetSlug: string,
  allPosts: any[] = [],
  allPages: any[] = [],
) {
  const mentions = posts
    .filter((post) => post.id !== targetSlug)
    .map((post) => {
      // Skip if body is not available
      if (!post.body) return null;

      // Check both wikilinks and standard markdown links
      const wikilinks = extractWikilinks(post.body);
      const standardLinks = extractStandardLinks(post.body);
      const allLinks = [...wikilinks, ...standardLinks];

      const matchingLinks = allLinks.filter((link) => link.slug === targetSlug);

      if (matchingLinks.length > 0) {
        // Use the original link text from the content for excerpt creation
        const originalLinkText = matchingLinks[0].link;
        const excerptResult = createExcerptAroundWikilink(
          post.body,
          originalLinkText,
          allPosts,
          allPages,
        );
        return {
          title: post.data.title,
          slug: post.id,
          excerpt: excerptResult,
        };
      }
      return null;
    })
    .filter(Boolean);

  return mentions;
}

// Create excerpt around wikilink for context
function createExcerptAroundWikilink(
  content: string,
  linkText: string,
  allPosts: any[] = [],
  allPages: any[] = [],
): string {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, "");

  // Try to find wikilink pattern first
  const wikilinkPattern = `\\[\\[${linkText}[^\\]]*\\]\\]`;
  const wikilinkRegex = new RegExp(wikilinkPattern, "i");

  let match;
  let searchStart = 0;

  // Find the wikilink that's not in code
  while (
    (match = wikilinkRegex.exec(withoutFrontmatter.slice(searchStart))) !== null
  ) {
    const actualIndex = searchStart + match.index!;

    // Check if this wikilink is inside backticks
    if (!isWikilinkInCode(withoutFrontmatter, actualIndex)) {
      const result = extractExcerptAtPosition(
        withoutFrontmatter,
        actualIndex,
        match[0].length,
        withoutFrontmatter.length,
      );
      return result.excerpt;
    }

    searchStart = actualIndex + match[0].length;
    wikilinkRegex.lastIndex = 0; // Reset regex for next search
  }

  // If no wikilink found, try to find standard markdown links that point to this linkText
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let markdownMatch;

  // Reset regex lastIndex before searching
  markdownLinkRegex.lastIndex = 0;

  while (
    (markdownMatch = markdownLinkRegex.exec(withoutFrontmatter)) !== null
  ) {
    const [fullMatch, displayText, url] = markdownMatch;

    // Check if this markdown link is inside code blocks or inline code
    if (!isWikilinkInCode(withoutFrontmatter, markdownMatch.index)) {
      // Check if this URL points to our target linkText
      if (isInternalLink(url)) {
        const { linkText: urlLinkText } = extractLinkTextFromUrlWithAnchor(
          url,
          allPosts,
          allPages,
        );
        if (urlLinkText) {
          // Normalize both linkText and urlLinkText for comparison
          const normalizedLinkText = linkText.replace(/\/index$/, "");
          const normalizedUrlLinkText = urlLinkText.replace(/\/index$/, "");

          if (
            normalizedUrlLinkText === normalizedLinkText ||
            urlLinkText === linkText
          ) {
            const result = extractExcerptAtPosition(
              withoutFrontmatter,
              markdownMatch.index,
              fullMatch.length,
              withoutFrontmatter.length,
            );
            return result.excerpt;
          }
        }
      }
    }
  }

  return "";
}

// Helper function to extract excerpt at a specific position
function extractExcerptAtPosition(
  content: string,
  position: number,
  linkLength: number,
  contentLength: number,
): { excerpt: string; isAtStart: boolean; isAtEnd: boolean } {
  const contextLength = 100; // Context before and after the link (desired) - reduced to focus on relevant content
  const minContextLength = 60; // Minimum context before/after the link (required) - reduced
  const maxExcerptLength = 200; // Maximum final excerpt length (about 3 lines)

  // Get context around the match
  // Ensure we don't cut off in the middle of a link - extend end if needed
  // Also avoid including code blocks in excerpts - if we hit a code block boundary, stop there
  // Start with more context since markdown cleaning reduces content significantly
  // If link is near the end, extract more context from before (can't extend after)
  const isNearEnd = contentLength - (position + linkLength) < minContextLength;
  const contextBeforeLink = isNearEnd
    ? Math.max(contextLength * 2, 250)
    : contextLength; // Double context if near end

  let start = Math.max(0, position - contextBeforeLink);
  let end = Math.min(
    contentLength,
    position + linkLength + (isNearEnd ? 0 : contextLength),
  );

  // Store initial boundaries to check minimum context after adjustments
  const initialStart = start;
  const initialEnd = end;

  // Check if our excerpt window includes any code blocks - if so, adjust boundaries
  const codeBlockRegex = /```[\s\S]*?```/g;
  let codeBlockMatch;
  codeBlockRegex.lastIndex = 0; // Reset

  while ((codeBlockMatch = codeBlockRegex.exec(content)) !== null) {
    const codeBlockStart = codeBlockMatch.index;
    const codeBlockEnd = codeBlockMatch.index + codeBlockMatch[0].length;

    // If the link itself is inside a code block, we shouldn't be extracting an excerpt
    // (This should be caught by isWikilinkInCode, but double-check)
    if (position >= codeBlockStart && position < codeBlockEnd) {
      // This is an error case - return empty excerpt
      return { excerpt: "", isAtStart: false, isAtEnd: false };
    }

    // If code block starts within our excerpt window, adjust end to before it
    if (
      codeBlockStart > start &&
      codeBlockStart < end &&
      codeBlockStart > position
    ) {
      end = codeBlockStart; // Stop excerpt before code block
    }

    // If code block ends within our excerpt window and starts before, adjust start to after it
    if (
      codeBlockEnd > start &&
      codeBlockEnd < position &&
      codeBlockStart < start
    ) {
      start = codeBlockEnd; // Start excerpt after code block
    }
  }

  // After code block adjustments, ensure we still have minimum context
  // Re-check context before/after to ensure we have enough
  const contextBefore = position - start;
  const contextAfter = end - (position + linkLength);

  // If code block adjustments reduced context too much, try to extend in the other direction
  if (contextBefore < minContextLength && start > 0) {
    const neededBefore = minContextLength - contextBefore;
    const desiredStart = Math.max(0, start - neededBefore);
    // Only extend if we're not hitting a code block (re-check)
    let canExtend = true;
    codeBlockRegex.lastIndex = 0;
    while ((codeBlockMatch = codeBlockRegex.exec(content)) !== null) {
      const codeBlockEnd = codeBlockMatch.index + codeBlockMatch[0].length;
      if (codeBlockEnd > desiredStart && codeBlockEnd <= start) {
        canExtend = false;
        break;
      }
    }
    if (canExtend) {
      start = desiredStart;
    }
  }

  if (contextAfter < minContextLength && end < contentLength) {
    const neededAfter = minContextLength - contextAfter;
    const desiredEnd = Math.min(contentLength, end + neededAfter);
    // Only extend if we're not hitting a code block (re-check)
    let canExtend = true;
    codeBlockRegex.lastIndex = 0;
    while ((codeBlockMatch = codeBlockRegex.exec(content)) !== null) {
      const codeBlockStart = codeBlockMatch.index;
      if (codeBlockStart >= end && codeBlockStart < desiredEnd) {
        canExtend = false;
        break;
      }
    }
    if (canExtend) {
      end = desiredEnd;
    }
  }

  // Check if the match itself is a wikilink - if so, find its complete length
  // This handles wikilinks with anchors and display text that are longer than expected
  const matchContent = content.substring(
    position,
    Math.min(position + 100, contentLength),
  );
  if (matchContent.startsWith("[[")) {
    // This is a wikilink - find the complete wikilink including any anchor and display text
    const fullWikilinkMatch = content
      .substring(position)
      .match(/^\[\[([^\]]+)(?:\|([^\]]+))?\]\]/);
    if (fullWikilinkMatch) {
      const actualLinkLength = fullWikilinkMatch[0].length;
      // Update linkLength to the actual length and extend end if needed
      if (actualLinkLength > linkLength) {
        linkLength = actualLinkLength;
        end = Math.min(contentLength, position + linkLength + contextLength);
      }
    }
  }

  // Check if we're cutting off in the middle of a link after our match
  const afterPosition = content.substring(position + linkLength);

  // Check for markdown links after our match
  const markdownLinkMatch = afterPosition.match(/^[^\]]*\][^\)]*\)/);
  if (
    markdownLinkMatch &&
    end < position + linkLength + markdownLinkMatch[0].length
  ) {
    end = Math.min(
      contentLength,
      position + linkLength + markdownLinkMatch[0].length + 50,
    );
  }

  // Check for wikilinks after our match
  const wikilinkMatch = afterPosition.match(/^\[\[([^\]]+)(?:\|([^\]]+))?\]\]/);
  if (wikilinkMatch && end < position + linkLength + wikilinkMatch[0].length) {
    end = Math.min(
      contentLength,
      position + linkLength + wikilinkMatch[0].length + 50,
    );
  }

  // Determine if we're at the start or end of content
  const isAtStart = start === 0;
  const isAtEnd = end >= contentLength;

  let excerpt = content.slice(start, end);

  // Clean up excerpt and strip markdown syntax (but preserve links for processExcerptLinks)
  // First, normalize whitespace and newlines
  excerpt = excerpt
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Normalize all whitespace to single spaces
    .trim();

  // Strip markdown formatting (but preserve links for processExcerptLinks)
  // Process code blocks first (before other formatting that might conflict)
  // Remove code blocks entirely, including any trailing/leading fragments
  excerpt = excerpt
    .replace(/```[\s\S]*?```/g, " ") // Remove complete code blocks entirely (replace with space)
    .replace(/```[\s\S]*$/g, " ") // Remove incomplete code blocks at end
    .replace(/^[\s\S]*?```/g, " ") // Remove incomplete code blocks at start
    .replace(/```+/g, " ") // Remove any remaining code block markers (``` or ````` etc)
    // Remove inline code - remove the entire inline code block completely
    // This includes file paths, commands, config keys, etc. that appear in backticks
    .replace(/`([^`\n]+)`/g, " ") // Remove inline code entirely (must have matching backticks, no newlines)
    // Then process other formatting - be thorough and catch all cases
    .replace(/\*\*([^*]+?)\*\*/g, "$1") // Remove bold markers **text** -> text (non-greedy)
    .replace(/\*([^*\s][^*]*?[^*\s])\*/g, "$1") // Remove italic markers *text* -> text (but not single * characters)
    .replace(/\*([^*\s]+)\*/g, "$1") // Catch single-word italic *word* -> word
    .replace(/_{1,2}([^_]+)_{1,2}/g, "$1") // Remove underline markers, keep text
    .replace(/~~([^~]+)~~/g, "$1") // Remove strikethrough markers, keep text
    .replace(/#{1,6}\s+/g, "") // Remove headers
    // Remove markdown syntax patterns that appear in the middle of text
    .replace(/\s*>\s*\[![\w-]+\]\s*/g, " ") // Remove callout syntax like "> [!TYPE]"
    .replace(/\s*>\s*/g, " ") // Remove standalone > characters (blockquote markers)
    .replace(/\s*---+\s*/g, " ") // Remove horizontal rules (---, ----, etc.)
    .replace(/\s*\[![\w-]+\]\s*/g, " ") // Remove any remaining callout syntax [!TYPE]
    .replace(/^-\s+/gm, "") // Remove list markers at start
    .replace(/^\d+\.\s+/gm, "") // Remove numbered list markers
    // Final cleanup of any remaining markdown artifacts
    .replace(/\*\*+/g, "") // Remove any remaining bold markers (trailing **, ***, etc.)
    .replace(/\s+/g, " ") // Normalize whitespace again
    .trim();

  // Clean up incomplete fragments and sentences - be very aggressive
  // Multiple passes to catch all variations and patterns
  for (let pass = 0; pass < 5; pass++) {
    excerpt = excerpt
      // Remove patterns like "Label: - Label:" (consecutive orphaned labels)
      .replace(/([A-Z][a-z]+):\s*-\s*([A-Z][a-z]+):/g, "")
      // Remove "Label: - " patterns (but only if it's truly orphaned - followed by another label or end)
      .replace(/\b([A-Z][a-z]+):\s*-\s*(?=[A-Z][a-z]+:|$)/g, "") // Only if followed by label or end
      // Remove orphaned labels at end (any label ending with colon and no content)
      // This catches structural patterns like "Label:" or "Multi-word Label:" at end of excerpt
      .replace(/\b([A-Z][a-z]+(?:\s+[a-z]+)?):\s*$/g, "") // Remove trailing labels (like "Callouts:", "Horizontal rule:", etc.)
      // Remove patterns like "text - Label:" where the label has no content (orphaned list items)
      // But be careful - don't remove valid patterns like "For example:" which has content after the colon
      .replace(
        /([a-z\s]+)\s+-\s+([A-Z][a-z]+(?:\s+[a-z]+)?):\s*(?=[A-Z]|\[|$)/g,
        "$1 ",
      ) // Only if followed by capital, link, or end
      // Remove standalone dashes that are list item markers before labels
      .replace(/\s*-\s*(?=[A-Z][a-z]+(?:\s+[a-z]+)?:)/g, " ") // Handles multi-word labels
      // Remove trailing dashes and colons that are fragments
      .replace(/:\s*$/, "") // Remove trailing colon
      .replace(/\s*-\s*$/, "") // Remove trailing dash
      // Clean up multiple spaces
      .replace(/\s+/g, " ")
      .trim();
  }

  // Final cleanup - remove only syntax/formatting artifacts
  // NO WORD OR PHRASE MATCHING - only structural markdown syntax patterns

  excerpt = excerpt
    // Remove any remaining code block markers (markdown syntax)
    .replace(/```+/g, " ") // Remove ``` markers (one or more)
    .replace(/\s*```\s*/g, " ") // Remove standalone ``` with whitespace
    // Remove orphaned markdown syntax patterns
    // Patterns like "Label:" followed immediately by another "Label:" or end (structural, not word-specific)
    .replace(
      /\b([A-Z][a-z]+(?:\s+[a-z]+)?):\s+(?=[A-Z][a-z]+(?:\s+[a-z]+)?:|$)/g,
      " ",
    ) // Label: followed by Label: or end (structural pattern)
    // Remove trailing labels (markdown list syntax artifact)
    .replace(/\b([A-Z][a-z]+(?:\s+[a-z]+)?):\s*$/g, "") // Multi-word labels at end (structural pattern)
    // Clean up whitespace
    .replace(/\s+/g, " ")
    .trim();

  // Remove duplicate consecutive words/phrases (common after code stripping)
  // Only remove duplicates if they're clearly unintentional (very close together)
  // Be conservative - don't remove duplicates that might be intentional
  for (let dupPass = 0; dupPass < 2; dupPass++) {
    excerpt = excerpt
      // Only remove duplicates if separated by space and not part of a larger phrase
      .replace(/\b(\w+)\s+\1\b(?=\s|$)/gi, "$1") // Remove single-word duplicates at word boundaries
      .replace(/(\[\[[^\]]+\]\])\s+\1(?=\s|$)/g, "$1") // Remove duplicate wikilinks [[text]] [[text]]
      .replace(/(\[[^\]]+\]\([^\)]+\))\s+\1(?=\s|$)/g, "$1") // Remove duplicate markdown links [text](url) [text](url)
      .replace(/\s+/g, " ") // Normalize spaces between passes
      .trim();
  }
  // Final whitespace normalization
  excerpt = excerpt.replace(/\s+/g, " ").trim();

  // Ensure minimum context AFTER cleaning - if cleaned excerpt is too short, extend and re-clean
  // Check the cleaned excerpt length to ensure we have enough meaningful content
  const cleanedWords = excerpt
    .split(/\s+/)
    .filter((w) => w.length > 0 && w.match(/[a-zA-Z0-9]/));
  const minCleanedWords = 10; // Minimum words in cleaned excerpt
  const minCleanedLength = 60; // Minimum characters in cleaned excerpt

  // Recalculate context before link (start may have changed during code block adjustments)
  const currentContextBefore = position - start;

  // If cleaned excerpt is too short, we need more raw content
  if (
    (cleanedWords.length < minCleanedWords ||
      excerpt.length < minCleanedLength) &&
    start > 0
  ) {
    // Calculate how much more raw content we need (markdown takes ~2-3x space)
    const currentRawLength = end - start;
    const ratio = excerpt.length > 0 ? currentRawLength / excerpt.length : 3; // How much raw content per cleaned char (default 3x if empty)
    const neededCleaned = Math.max(
      minCleanedLength - excerpt.length,
      (minCleanedWords - cleanedWords.length) * 8,
    );
    const additionalRaw = Math.ceil(neededCleaned * Math.max(ratio, 2) * 1.5); // Add buffer, minimum 2x ratio

    // Try extending before (prioritize getting context before the link)
    const newStart = Math.max(0, start - additionalRaw);

    // Check for code blocks
    let canExtend = true;
    const codeBlockRegex4 = /```[\s\S]*?```/g;
    codeBlockRegex4.lastIndex = 0;
    while ((codeBlockMatch = codeBlockRegex4.exec(content)) !== null) {
      const codeBlockEnd = codeBlockMatch.index + codeBlockMatch[0].length;
      if (codeBlockEnd > newStart && codeBlockEnd <= start) {
        canExtend = false;
        break;
      }
    }

    if (canExtend && newStart < start) {
      start = newStart;
      // Re-extract and re-clean the extended excerpt
      let newExcerpt = content.slice(start, end);

      // Re-run all cleaning steps
      newExcerpt = newExcerpt
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/```[\s\S]*$/g, " ")
        .replace(/^[\s\S]*?```/g, " ")
        .replace(/```+/g, " ")
        .replace(/`([^`]+)`/g, " ")
        .replace(/\*\*([^*]+?)\*\*/g, "$1")
        .replace(/\*([^*\s][^*]*?[^*\s])\*/g, "$1")
        .replace(/\*([^*\s]+)\*/g, "$1")
        .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
        .replace(/~~([^~]+)~~/g, "$1")
        .replace(/#{1,6}\s+/g, "")
        .replace(/\s*>\s*\[![\w-]+\]\s*/g, " ")
        .replace(/\s*>\s*/g, " ")
        .replace(/\s*---+\s*/g, " ")
        .replace(/\s*\[![\w-]+\]\s*/g, " ")
        .replace(/^-\s+/gm, "")
        .replace(/^\d+\.\s+/gm, "")
        .replace(/\*\*+/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Re-run cleanup passes
      for (let pass = 0; pass < 5; pass++) {
        newExcerpt = newExcerpt
          .replace(/([A-Z][a-z]+):\s*-\s*([A-Z][a-z]+):/g, "")
          .replace(/\b([A-Z][a-z]+):\s*-\s*/g, "")
          .replace(/\bStart\s+lines\s+with\b/gi, " ")
          .replace(/\bto\s+separate\s+columns\b/gi, " ")
          .replace(/\bseparate\s+columns\b/gi, " ")
          .replace(/\bUse\s+to\s+separate\b/gi, " ")
          .replace(/\bcolumns\b/gi, " ")
          .replace(/\b([A-Z][a-z]+(?:\s+[a-z]+)?):\s*$/g, "")
          .replace(
            /([a-z\s]+)\s+-\s+([A-Z][a-z]+(?:\s+[a-z]+)?):\s*(?=[A-Z]|\[|$)/g,
            "$1 ",
          )
          .replace(/\s*-\s*(?=[A-Z][a-z]+(?:\s+[a-z]+)?:)/g, " ")
          .replace(/:\s*$/, "")
          .replace(/\s*-\s*$/, "")
          .replace(/\s+/g, " ")
          .trim();
      }

      // Re-run pattern removal
      const patternsToRemove2 = [
        /\bStart\s+lines\s+with\b/gi,
        /\bto\s+separate\s+columns\b/gi,
        /\bseparate\s+columns\b/gi,
        /\bUse\s+to\s+separate\b/gi,
        /\bUse\s+to\s+separate\s+columns\b/gi,
        /\bcolumns\b/gi,
      ];

      for (const pattern of patternsToRemove2) {
        let previousExcerpt = "";
        while (newExcerpt !== previousExcerpt) {
          previousExcerpt = newExcerpt;
          newExcerpt = newExcerpt.replace(pattern, " ");
        }
      }

      newExcerpt = newExcerpt
        .replace(/```+/g, " ")
        .replace(/\s*```\s*/g, " ")
        .replace(
          /\b([A-Z][a-z]+(?:\s+[a-z]+)?):\s+(?=[A-Z][a-z]+(?:\s+[a-z]+)?:|$)/g,
          " ",
        )
        .replace(/\b([A-Z][a-z]+(?:\s+[a-z]+)?):\s*$/g, "")
        .replace(/\s+/g, " ")
        .trim();

      excerpt = newExcerpt;
    }
  }

  // Truncate to maximum length if needed (preserve word boundaries and don't cut links)
  // CRITICAL: Always truncate at word boundaries - never cut words in half
  // CRITICAL: If truncating would cut off a link at the end, try to include the complete link
  if (excerpt.length > maxExcerptLength) {
    const truncated = excerpt.substring(0, maxExcerptLength);

    // Check if we're cutting off in the middle of a link (wikilink or markdown)
    const incompleteWikilinkMatch = truncated.match(/\[\[[^\]]*$/);
    const incompleteMarkdownMatch = truncated.match(/\[[^\]]*\]\([^\)]*$/);

    // Also check if there's a complete link right after the truncation point
    const afterTruncation = excerpt.substring(maxExcerptLength);
    const completeLinkAfter = afterTruncation.match(
      /^[^\[]*(\[[^\]]+\]\([^\)]+\)|\[\[[^\]]+\]\])/,
    );

    let truncateAt = maxExcerptLength;

    if (incompleteWikilinkMatch || incompleteMarkdownMatch) {
      // We're cutting off a link - check if we can include the complete link
      if (completeLinkAfter && completeLinkAfter.index !== undefined) {
        // There's a complete link right after truncation - include it
        const linkEnd =
          maxExcerptLength +
          (completeLinkAfter.index || 0) +
          completeLinkAfter[1].length;
        // Only extend if it's reasonable (not more than 50% over limit)
        if (linkEnd <= maxExcerptLength * 1.5) {
          truncateAt = linkEnd;
          // Find word boundary after the link
          const afterLink = excerpt.substring(truncateAt, truncateAt + 30);
          const nextSpace = afterLink.indexOf(" ");
          if (nextSpace > 0) {
            truncateAt = truncateAt + nextSpace;
          }
        } else {
          // Link is too far - truncate before the incomplete link
          const incompleteStart = incompleteWikilinkMatch
            ? incompleteWikilinkMatch.index || 0
            : incompleteMarkdownMatch?.index || 0;
          if (incompleteStart > 0) {
            truncateAt = incompleteStart;
          }
        }
      } else {
        // No complete link found after - truncate before incomplete link
        const incompleteStart = incompleteWikilinkMatch
          ? incompleteWikilinkMatch.index || 0
          : incompleteMarkdownMatch?.index || 0;
        if (incompleteStart > 0) {
          truncateAt = incompleteStart;
        }
      }
    } else if (
      completeLinkAfter &&
      completeLinkAfter.index !== undefined &&
      completeLinkAfter.index < 20
    ) {
      // No incomplete link, but there's a complete link very close after truncation - include it
      const linkEnd =
        maxExcerptLength +
        (completeLinkAfter.index || 0) +
        completeLinkAfter[1].length;
      if (linkEnd <= maxExcerptLength * 1.3) {
        truncateAt = linkEnd;
        // Find word boundary after the link
        const afterLink = excerpt.substring(truncateAt, truncateAt + 30);
        const nextSpace = afterLink.indexOf(" ");
        if (nextSpace > 0) {
          truncateAt = truncateAt + nextSpace;
        }
      }
    }

    // ALWAYS truncate at word boundary - find last space before truncate point
    const toTruncate = excerpt.substring(0, truncateAt);
    const lastSpace = toTruncate.lastIndexOf(" ");

    // Always use word boundary if available (unless it's at the very start)
    if (lastSpace > 10) {
      // Found a word boundary - use it (minimum 10 chars to avoid truncating too early)
      excerpt = toTruncate.substring(0, lastSpace).trim();
    } else if (lastSpace > 0) {
      // Found a space but very early - still better than cutting a word
      excerpt = toTruncate.substring(0, lastSpace).trim();
    } else {
      // No space found at all - this is very rare
      // Try to find any whitespace character as fallback
      const lastWhitespace = toTruncate.search(/\s+$/);
      if (lastWhitespace > 0) {
        excerpt = toTruncate.substring(0, lastWhitespace).trim();
      } else {
        // Truly no whitespace - truncate at safe point (shouldn't happen in normal text)
        excerpt = toTruncate.trim();
      }
    }
  }

  return { excerpt, isAtStart, isAtEnd };
}


