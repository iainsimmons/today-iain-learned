# Markdown Processing Migration Plan

## Goal

Replace the `processor: unified()` (remark/rehype) pipeline with Astro 7's **built-in Satteri processor** — which is already the default, just not being used.

---

## 1. Key Discovery

**Astro 7 already uses Satteri as its default markdown processor.** Your project has been overriding this with `processor: unified()` from `@astrojs/markdown-remark`. Switching to Satteri means:

- **Removing** the `processor: unified()` block (lines 62-112 of `astro.config.mjs`)
- **Optionally adding** `processor: satteri()` with features + 3 custom plugins
- **Removing** the 21 unused plugin imports at the top of the file
- **Removing** the `@astrojs/markdown-remark`, `unified`, and all remark/rehype npm deps
- **Adding** `@astrojs/markdown-satteri` npm dep (probably already installed as dep of Astro)

What you get from Satteri + Astro by default:

| Feature | How it's handled |
|---------|-----------------|
| GFM (tables, footnotes, strikethrough, task lists, autolinks) | Built-in, always on |
| SmartyPants (fancy quotes, em-dashes) | Built-in, always on |
| Heading IDs (`id` attributes) | Added by Astro automatically (after custom plugins) |
| Image optimization (WebP, responsive, lazy) | Astro's built-in markdown image handling |
| Syntax highlighting | `astro-expressive-code` integration (separate, unaffected) |
| `[[Wikilinks]]` | Satteri feature: `features: { wikilinks: true }` |

---

## 2. Final Plugin Inventory

### Everything REMOVED (no replacement needed)

| Plugin | Reason |
|--------|--------|
| `remarkInternalLinks` (wikilinks) | Satteri built-in `features: { wikilinks: true }` |
| `remarkInternalLinks` (URL mapping) | User will rewrite links to final URLs |
| `remarkObsidianComments` | `%%...%%` removed from 2 source files |
| `remarkFolderImages` | Switch to `![alt](image.jpg)` — Astro optimizes natively |
| `remarkObsidianEmbeds` | No YouTube/iframe embeds; video uses `<video>` HTML tag |
| `remarkBases` | No usage |
| `remarkImageCaptions` | Replaced by HAST image caption plugin |
| `remarkMath` / `rehypeKatex` | No math content |
| `remarkBreaks` | Remove and test |
| `remarkImageGrids` | No usage |
| `remarkMermaid` | No usage |
| `remarkReadingTime` | Not used |
| `remarkToc` | Layout-level TOC instead |
| `rehypeExternalLinks` | User doesn't want special processing |
| `rehypeTableWrappers` | No tables |
| `rehypeMark` | No usage |
| `rehypeSlug` | Astro adds heading IDs automatically |
| `rehypeImageAttributes` | Astro handles image optimization |
| `rehypeNormalizeAnchors` | Rewritten links won't need normalization |

### KEPT as Satteri plugins (3 total)

1. **Callouts** (MDAST plugin) — `> [!TYPE]` blockquotes → callout HTML
2. **Heading anchors** (HAST plugin) — Add anchor links to headings (Astro adds IDs but not links)
3. **Image captions** (HAST plugin) — Wrap `<img>` with alt text in `<figure><figcaption><em>alt</em></figcaption></figure>`

### KEPT as Astro config features (1)

4. **Wikilinks** — `features: { wikilinks: true }` — Satteri built-in

---

## 3. What the `astro.config.mjs` Change Looks Like

### Before (current):

```js
import { unified } from "@astrojs/markdown-remark";
import remarkInternalLinks from "...";
import remarkFolderImages from "...";
// ... 19 more imports

export default defineConfig({
  markdown: {
    processor: unified({
      remarkPlugins: [ /* 13 plugins */ ],
      rehypePlugins: [ /* 8 plugins */ ],
    }),
  },
});
```

### After:

```js
import { satteri } from "@astrojs/markdown-satteri";
import { satteriCalloutPlugin } from "./src/utils/satteri/callouts.ts";
import { satteriHeadingAnchors } from "./src/utils/satteri/heading-anchors.ts";
import { satteriImageCaptions } from "./src/utils/satteri/image-captions.ts";

export default defineConfig({
  markdown: {
    processor: satteri({
      features: { wikilinks: true },
      mdastPlugins: [satteriCalloutPlugin],
      hastPlugins: [satteriHeadingAnchors, satteriImageCaptions],
    }),
  },
});
```

**Plugin imports from `satteri`** (re-exported by `@astrojs/markdown-satteri`):

```typescript
import { defineMdastPlugin, defineHastPlugin } from "satteri";
```

---

## 4. New Plugin Files to Create

```
src/utils/satteri/
├── callouts.ts           — defineMdastPlugin: blockquote → callout div
├── heading-anchors.ts    — defineHastPlugin: add anchor links to headings
├── image-captions.ts     — defineHastPlugin: wrap img+alt in figure/figcaption
└── index.ts              — re-export all three plugins
```

`src/utils/internallinks.ts` — Keep `findLinkedMentions()`, `extractWikilinks()`, `extractStandardLinks()` — these operate on raw strings at the layout level, not through the processor.

---

## 5. Dependencies to Remove

```bash
pnpm remove @astrojs/markdown-remark unified unist-util-visit
pnpm remove remark-breaks remark-math remark-reading-time remark-toc
pnpm remove rehype-katex rehype-slug rehype-autolink-headings
pnpm remove katex mermaid
pnpm remove @astrojs/mdx           # No .mdx files in project
```

---

## 6. Source Files to Remove

```
src/utils/remark-callouts.ts          — replaced by satteri plugin
src/utils/remark-image-grids.ts       — unused
src/utils/remark-mermaid.ts           — unused
src/utils/remark-bases.ts             — unused
src/utils/remark-obsidian-embeds.ts   — unused
src/utils/remark-obsidian-comments.ts — unused
src/utils/remark-inline-tags.ts       — unused
src/utils/rehype-mark.ts              — unused
src/utils/rehype-table-wrappers.ts    — unused
src/utils/rehype-external-links.ts    — unused
src/utils/rehype-image-attributes.ts  — unused
src/utils/rehype-normalize-anchors.ts — unused
```

---

## 7. Content Changes

### Image syntax (12 posts)

Convert `![[image.ext]]` to `![description](image.ext)` across 12 posts. Keeps things in: `src/content/posts/`.

After conversion, Astro's built-in image handling optimizes them (WebP, responsive, lazy).
The Satteri HAST image caption plugin wraps `<img>` with alt text in `<figure><figcaption>`.

### Video embed (1 post)

In `upgrading-to-neovim-0-12-built-in-undotree-plugin-incremental-selections.md`:
```
Before: ![[attachments/nvim-incremental-selection.mp4|Incremental selection in Neovim version 0.12]]
After:  <video src="attachments/nvim-incremental-selection.mp4" controls></video>
```

### Remove `%%...%%` comments (2 files)

```
src/content/special/posts.md — remove: %%Modifying the description...%%
src/content/special/home.md  — remove: %%The title and description...%%
```

### Rewrite links to final URLs (check existing content)

Replace any `/pages/...` → `/...` and `/special/...` → final URL. Only needed if current content uses these patterns.

---

## 8. Integration Steps (Ordered)

```
Phase 1: Create
├── src/utils/satteri/callouts.ts            MDAST plugin
├── src/utils/satteri/heading-anchors.ts     HAST plugin
├── src/utils/satteri/image-captions.ts      HAST plugin
└── src/utils/satteri/index.ts               re-exports

Phase 2: Configure
├── astro.config.mjs — remove processor: unified(), add processor: satteri()
└── astro.config.mjs — remove all 21 plugin imports, remove @astrojs/mdx import

Phase 3: Content
├── Convert ![[image.ext]] → ![alt](image.ext) in 12 posts
├── Convert ![[file.mp4|alt]] → <video> in 1 post
├── Remove %%comments%% from 2 special files
└── Rewrite any /pages/xxx or /special/xxx links to final URLs

Phase 4: Cleanup
├── pnpm remove ... (13 npm packages)
└── rm 12 unused source files

Phase 5: Test
├── pnpm run dev — verify spacing, images, callouts, links, anchors
├── pnpm run build — verify no errors
└── Check site locally for visual regressions
```

---

## 9. Plugin Implementation Details

### Plugin Import

All Satteri plugins import from the `satteri` package (re-exported by `@astrojs/markdown-satteri`):

```typescript
import { defineMdastPlugin, defineHastPlugin } from "satteri";
```

### Plugin Structure

Satteri plugins are objects with a `name` and **named visitor functions** keyed by node type (not a generic `visit()` function):

```typescript
const plugin = defineMdastPlugin({
  name: "my-plugin",
  // Named visitors for each MDAST node type
  heading(node, ctx) { /* ... */ },
  blockquote(node, ctx) { /* ... */ },
  text(node, ctx) { /* ... */ },
});
```

### Visitor Return Values

| Return value | Effect |
|---|---|
| `undefined` / `null` / `void` | Keep node, apply `ctx` mutations |
| A different node | Replace the visited node |
| `{ raw: string }` | Splice raw Markdown (re-parsed) — MDAST only |
| `{ rawHtml: string }` | Splice raw HTML (passed through) — MDAST only |

### Mutation Context

All mutations go through `ctx` methods — direct node property writes have no effect:

```typescript
// ❌ WRONG: direct mutation
node.depth = 2;  // ignored

// ✅ CORRECT: through ctx
ctx.setProperty(node, "depth", 2);
```

**Tree mutation methods:**

| Method | Effect |
|---|---|
| `removeNode(node)` | Drop node from parent |
| `replaceNode(node, newNode)` | Swap the node |
| `insertBefore(node, newNode)` | Insert sibling before |
| `insertAfter(node, newNode)` | Insert sibling after |
| `wrapNode(node, parentNode)` | Wrap node in parentNode (becomes its first child) |
| `prependChild(node, childNode)` | Insert as first child |
| `appendChild(node, childNode)` | Insert as last child |
| `insertChildAt(node, index, childNode)` | Insert at position |
| `setProperty(node, key, value)` | Replace one field |
| `textContent(node)` | Concatenated text of subtree |
| `parent(node)` | Get parent node |
| `indexOf(node)` | Get index in parent's children |

### 9a. Callout Plugin (MDAST)

```typescript
import { defineMdastPlugin } from "satteri";

export const satteriCalloutPlugin = defineMdastPlugin({
  name: "callouts",
  blockquote(node, ctx) {
    // First child should be a paragraph
    const firstPara = node.children?.[0];
    if (firstPara?.type !== "paragraph") return;

    // First paragraph's first child should be text
    const firstText = firstPara.children?.[0];
    if (firstText?.type !== "text") return;

    // Check for [!TYPE] pattern
    const match = firstText.value.match(/^\[!(\w+)\]\s*/i);
    if (!match) return;

    const type = match[1].toLowerCase();

    // Remove [!TYPE] from the text content
    firstText.value = firstText.value.slice(match[0].length);

    // Convert to: { rawHtml: '<div class="callout callout-note">...</div>' }
    // We need to render the children as HTML. Simplest approach:
    // Clone the blockquote's children and serialize to HTML.
    // But rawHtml is raw — we'd need to render the inner markdown.
    //
    // Better approach: transform the blockquote into our structure
    // while keeping it as MDAST nodes.
    //
    // Alternative: return rawHtml with manually serialized children.
    // Since callouts have simple content (paragraphs, lists), we can
    // let Satteri handle rendering by transforming the node type.

    // Strategy: keep the blockquote node, just modify it
    // Add a data attribute so a HAST plugin or CSS can style it:
    ctx.setProperty(node, "data", { hProperties: { className: `callout callout-${type}` } });
    // And strip the [!TYPE] prefix from the first paragraph text
  },
});
```

**Alternative (simpler, more reliable):** Since we need to transform the blockquote and insert a title element for the callout type, the cleanest approach is to restructure the MDAST tree: convert the blockquote's first paragraph into a callout-title heading, and leave the rest. Then use CSS for the rest of the callout styling. This avoids HTML serialization entirely.

```typescript
import { defineMdastPlugin } from "satteri";

export const satteriCalloutPlugin = defineMdastPlugin({
  name: "callouts",
  blockquote(node, ctx) {
    const firstPara = node.children?.[0];
    if (firstPara?.type !== "paragraph") return;

    const firstText = firstPara.children?.[0];
    if (firstText?.type !== "text") return;

    const match = firstText.value.match(/^\[!(\w+)\]\s*/i);
    if (!match) return;

    const type = match[1].toLowerCase();

    // Remove [!TYPE] from text
    firstText.value = firstText.value.slice(match[0].length);

    // Add callout class to the blockquote
    ctx.setProperty(node, "data", {
      hProperties: {
        className: `callout callout-${type}`,
      },
    });
  },
});
```

With CSS targeting `blockquote.callout` in global.css (styled the same as the current `.callout` class) — this is the simplest approach and works with Astro's default processing.

### 9b. Heading Anchor Plugin (HAST)

```typescript
import { defineHastPlugin } from "satteri";

export const satteriHeadingAnchors = defineHastPlugin({
  name: "heading-anchors",
  element: {
    filter: ["h2", "h3", "h4", "h5", "h6"],
    visit(node, ctx) {
      const id = node.properties?.id as string;
      if (!id) return;

      // Prepend anchor link as first child
      ctx.prependChild(node, {
        type: "element",
        tagName: "a",
        properties: {
          href: `#${id}`,
          className: ["anchor-link"],
          ariaLabel: "Link to this section",
        },
        children: [{ type: "text", value: "#" }],
      });
    },
  },
});
```

### 9c. Image Caption Plugin (HAST)

```typescript
import { defineHastPlugin } from "satteri";

export const satteriImageCaptions = defineHastPlugin({
  name: "image-captions",
  element: {
    filter: ["img"],
    visit(node, ctx) {
      const alt = node.properties?.alt as string;
      if (!alt || alt.trim() === "") return;

      const figcaptionNode = {
        type: "element",
        tagName: "figcaption",
        properties: { className: ["image-caption-container"] },
        children: [{
          type: "element",
          tagName: "em",
          children: [{ type: "text", value: alt }],
        }],
      };

      const figureNode = {
        type: "element",
        tagName: "figure",
        children: [],
      };

      // Wrap img in figure, then append figcaption after img inside figure
      ctx.wrapNode(node, figureNode);
      ctx.insertAfter(node, figcaptionNode);
    },
  },
});
```

### 9d. Wikilinks (Config Only)

```typescript
features: {
  wikilinks: true
  // Satteri's built-in wikilinks recognizes [[Target]] and [[Target|Label]]
  // and converts them to <a href="Target">Label</a> (or "Target" if no label)
  // Since you'll rewrite links to final URLs directly, this just handles
  // the remaining [[Post Title]] patterns that map to post slugs.
}
```

---

## 10. CSS Considerations

### Existing Caption CSS (global.css line ~1515)

The existing `img + p em` CSS handles captions that use a pattern like:
```markdown
![alt](image.jpg)
*caption text*
```

This CSS targets `<p><em>` that immediately follows `<img>`. With the new HAST plugin, captions will be inside `<figcaption>` instead. The existing CSS for `.image-caption-container` (already defined for the previous wikilink-based captions) should continue to work:

```css
.image-caption-container em {
  /* existing caption styling */
}
```

We may need to ensure the CSS targets `figcaption.image-caption-container em` or just let the existing class-based styling apply.

### Callout CSS

The current callout CSS targets `.callout` class. Since the MDAST plugin adds `className: `callout callout-${type}`` via `hProperties`, the existing CSS should work unchanged (blockquote elements with the .callout class).

---

## 11. Verification Checklist

- [ ] `pnpm run dev` starts without errors
- [ ] All 22 posts render with callouts styled correctly (inspect 4 posts with `> [!note]`)
- [ ] All images display from `![alt](image.jpg)` syntax (12 posts) with figure/figcaption wrapping when alt text present
- [ ] The video in the neovim-undotree post plays
- [ ] Wikilinks `[[Page]]` render as valid links
- [ ] Heading anchor links (🔗) appear on hover
- [ ] `pnpm run build` succeeds
- [ ] No console warnings about missing images
