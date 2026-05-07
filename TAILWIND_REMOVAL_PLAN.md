# Tailwind Removal + Component Cleanup Plan

## Core Principles
1. **Dark mode always on**: Use `dark:` variant values as the base styles
2. **Remove all `.dark` selectors** from global.css and use those values as defaults
3. **Replace `ring-*` classes** with simple `outline` CSS rules
4. **No `prefers-color-scheme`** media queries - hardcode dark values
5. **Keep `prose` class** but remove any Tailwind dependency

---

## Phase 0: Delete Unwanted Components
**Files to DELETE:**
- `src/components/ProjectCard.astro`
- `src/components/DocumentationCard.astro`
- `src/components/ProjectCategories.astro`
- `src/components/DocsSidebar.astro`
- `src/components/GraphModal.astro`
- `src/components/LocalGraph.astro`
- `src/utils/graph-theme-colors.ts`
- `src/utils/categories.ts`

**Files to cleanup references:**
- `src/content.config.ts` - Remove projects/docs collections
- `src/config.ts` - Remove projects/docs/graphView config options
- `src/layouts/PostLayout.astro` - Remove LocalGraph imports/usage
- `src/layouts/BaseLayout.astro` - Remove GraphModal import
- `src/components/CategoryFilter.astro` - Remove project-related logic

---

## Phase 0.5: Create Shared `RollPage.astro` Component
**New file**: `src/components/RollPage.astro`

Extract shared markup from `blogroll.astro` and `podroll.astro`:

**Props interface:**
```typescript
interface Props {
  title: string;
  description: string;
  collectionName: 'blogroll' | 'podroll';
  seeAlsoText: string;
  seeAlsoLink: string;
  toc: Array<{depth: number, slug: string, text: string}>;
  groups: Array<{title: string, feeds: Array<{title: string, xmlUrl: string, imageUrl: string | null}>}>;
  lastUpdated: {datetime: string, formatted: string} | null;
  hasTOC: boolean;
}
```

**Shared markup pattern (no Tailwind, uses semantic classes):**
```astro
<article class="roll-page">
  <div class="roll-page-content">
    <header class="roll-page-header">
      <h1 class="roll-page-title">{title}</h1>
    </header>
    <div class="roll-page-body">
      <!-- lastUpdated, description, see-also paragraph -->
      {groups.map((group, index) => (
        <section class="roll-page-group">
          <h2 class="roll-page-group-title" id={toc[index]?.slug}>{group.title}</h2>
          <div class="roll-page-feed-list">
            {group.feeds.map((feed) => (
              <div class="roll-page-feed-item">
                {feed.imageUrl ? (
                  <img src={feed.imageUrl} alt={feed.title} class="roll-page-feed-image" />
                ) : (
                  <DefaultFeedIcon class="roll-page-feed-icon" />
                )}
                <a href={feed.xmlUrl} target="_blank" rel="noopener noreferrer" class="roll-page-feed-link">
                  {feed.title}
                </a>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
</article>
```

**CSS (in RollPage.astro `<style>` block):**
```css
.roll-page {
  border: 1px solid rgb(var(--color-primary-700));
  background-color: rgb(var(--color-primary-900));
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  overflow: hidden;
}
.roll-page-content { padding: 1.5rem; }
.roll-page-header { margin-bottom: 2rem; }
.roll-page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--color-primary-50));
  margin-bottom: 1.5rem;
  line-height: 1.25;
}
.roll-page-body { /* prose styles */ }
.roll-page-group { margin-bottom: 2rem; }
.roll-page-group-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--color-primary-50));
  margin-bottom: 1rem;
}
.roll-page-feed-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.roll-page-feed-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.roll-page-feed-image {
  width: 2rem;
  height: 2rem;
  margin: 0.5rem 0;
  border-radius: 0.25rem;
  object-fit: cover;
}
.roll-page-feed-icon {
  width: 2rem;
  height: 2rem;
  margin: 0.5rem 0;
  flex-shrink: 0;
  color: rgb(var(--color-primary-400));
}
.roll-page-feed-link:hover { text-decoration: underline; }
```

**Then simplify `blogroll.astro` and `podroll.astro` to just:**
```astro
---
import RollPage from '@/components/RollPage.astro';
// ... fetch data
---
<BaseLayout seoData={seoData} hasTOC={shouldShowTOC}>
  <div class="page-container">
    <div class="page-inner">
      <RollPage title="Blogroll" description="..." ... />
      {shouldShowTOC && (
        <div class="toc-sidebar">
          <div class="toc-sticky" id="toc">
            <TableOfContents headings={toc} />
          </div>
        </div>
      )}
    </div>
  </div>
</BaseLayout>
```

---

## Phase 1: global.css Cleanup
**File**: `src/styles/global.css`

1. Remove lines 3-4: `@config "../../tailwind.config.mjs";` and `@import "tailwindcss";`
2. Remove all `:global(.dark)` wrappers and `.dark` class selectors
3. Convert all `dark:` variant styles to be the default (dark values become base values)
4. Replace `ring-*` classes with simple `outline` CSS rules
5. Remove `prefers-color-scheme` media query (lines ~1516-1534)
6. Keep `@layer base`, `@layer components`, `@layer utilities` structure
7. Keep `prose` class but remove Tailwind dependency

---

## Phase 2: Simple Components (3 files)
Minimal Tailwind usage, no responsive variants:
1. **`src/components/Icon.astro`** - SVG icon renderer
2. **`src/components/ScrollToTop.astro`** - Scroll button
3. **`src/components/GiscusComments.astro`** - Comments wrapper

---

## Phase 3: Button & Table (2 files)
Components with variants/state classes:
4. **`src/components/Button.astro`** - Already has `<style>`, needs Tailwind removed
5. **`src/components/BaseTable.astro`** - Table with sorting

---

## Phase 4: Footer & Header (2 files)
Layout components with navigation:
6. **`src/components/Footer.astro`** - Footer with social links
7. **`src/components/Header.astro`** - Header with nav, mobile menu

---

## Phase 5: Cards & Tags (2 files)
Reusable components with hover states:
8. **`src/components/PostCard.astro`** - Post cards
9. **`src/components/Tags.astro`** - Tags (already has extensive `<style>`)

---

## Phase 6: Navigation (3 files)
Components with active states:
10. **`src/components/Pagination.astro`** - Already has `<style>` block
11. **`src/components/TableOfContents.astro`** - TOC
12. **`src/components/CategoryFilter.astro`** - Now only handles blogroll/podroll categories

---

## Phase 7: Image Components (4 files)
Image handling:
13. **`src/components/ImageWrapper.astro`** - Core image wrapper
14. **`src/components/ImageGallery.astro`** - Gallery grid
15. **`src/components/ImageGalleryManager.astro`** - Gallery manager
16. **`src/components/Lightbox.astro`** - Image lightbox

---

## Phase 8: Complex Components (3 files)
Heavy Tailwind usage:
17. **`src/components/LinkedMentions.astro`** - Complex excerpts
18. **`src/components/PostContent.astro`** - Post content with TOC
19. **`src/components/MermaidDiagram.astro`** - Diagrams (kept, not "graph related")

---

## Phase 9: Command Palette (1 file)
Most complex component:
20. **`src/components/CommandPalette.astro`** - 1033 lines, ~40 class attributes

---

## Phase 10: Layouts (3 files)
Main layout wrappers:
21. **`src/layouts/BaseLayout.astro`** - Root layout
22. **`src/layouts/PostLayout.astro`** - Post layout
23. **`src/layouts/PageLayout.astro`** - Page layout

---

## Phase 11: Pages (6 files)
Page templates:
24. **`src/pages/index.astro`** - Homepage
25. **`src/pages/404.astro`**
26. **`src/pages/[...slug].astro`** - Dynamic pages
27. **`src/pages/posts/index.astro`** - Posts listing
28. **`src/pages/posts/[...slug].astro`** - Individual post
29. **`src/pages/posts/[page].astro`** - Paginated posts
30. **`src/pages/posts/tag/[...tag].astro`** - Tagged posts
31. **`src/pages/posts/tag/[...tag]/[page].astro`** - Paginated tags
32. **`src/pages/blogroll.astro`** - Now uses RollPage component
33. **`src/pages/podroll.astro`** - Now uses RollPage component

---

## Conversion Pattern (Dark-Mode-First)

### Pattern 1: Basic Utility → CSS Class
```astro
<!-- Before -->
<div class="p-4 text-sm text-primary-600 dark:text-primary-300">

<!-- After -->
<div class="my-component">
<style>
  .my-component {
    padding: 1rem;
    font-size: 0.875rem;
    color: rgb(var(--color-primary-300)); /* dark: value */
  }
</style>
```

### Pattern 2: Responsive Variants → Media Queries
```astro
<!-- Before -->
<div class="hidden md:flex items-center">

<!-- After -->
<div class="nav-menu">
<style>
  .nav-menu { display: none; }
  @media (min-width: 768px) {
    .nav-menu {
      display: flex;
      align-items: center;
    }
  }
</style>
```

### Pattern 3: State Variants → Pseudo-classes
```astro
<!-- Before -->
<a class="text-blue-500 hover:text-blue-700">

<!-- After -->
<a class="nav-link">
<style>
  .nav-link {
    color: rgb(var(--color-highlight-400)); /* dark: value */
  }
  .nav-link:hover {
    color: rgb(var(--color-highlight-300)); /* dark:hover: value */
  }
</style>
```

### Pattern 4: Group Hover → Nested Selectors
```astro
<!-- Before -->
<div class="group">
  <span class="group-hover:text-blue-500">
</div>

<!-- After -->
<div class="card">
  <span class="card-title">
<style>
  .card:hover .card-title {
    color: rgb(var(--color-highlight-500));
  }
</style>
```

### Pattern 5: Ring → Outline
```astro
<!-- Before -->
<button class="ring-2 ring-offset-2 ring-blue-500">

<!-- After -->
<button class="btn-primary">
<style>
  .btn-primary:focus-visible {
    outline: 2px solid rgb(var(--color-highlight-500));
    outline-offset: 2px;
  }
</style>
```

---

## Verification Checklist Per Phase
After each phase:
1. **Visual check**: Component renders correctly
2. **Dark mode**: Verify dark values are applied (site is always in dark mode now)
3. **Responsive**: Test at sm/md/lg breakpoints if component has responsive variants
4. **Interactions**: Hover/focus states work (no `ring-*` classes)
5. **No console errors**: No missing class errors
