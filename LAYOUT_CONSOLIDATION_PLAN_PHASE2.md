# Layout Consolidation Plan — Phase 2

## Goal
Eliminate remaining CSS duplication identified across `src/pages/`, `src/components/`, and `src/styles/global.css`. Consolidate repeated patterns (cards, containers, search results, galleries, empty states) into shared global classes.

---

## Critical Priority

### C1: Consolidate Card Pattern (11+ duplicate definitions)

**Problem**: The "dark card" container pattern (`background: primary-900; border: 1px solid primary-700; border-radius: 0.5rem; box-shadow`) is independently redefined in 11+ locations.

**Locations**:
| File | Lines | Class |
|------|-------|-------|
| `src/styles/global.css` | 618-628 | `.card` |
| `src/styles/global.css` | 1494-1509 | `.post-card` |
| `src/styles/global.css` | 1511-1526 | `.featured-post` (exact duplicate of `.post-card`) |
| `src/styles/global.css` | 2233-2238 | `.layout-article` |
| `src/components/PostCard.astro` | 155-161 | `.post-card` (overrides global) |
| `src/components/RollPage.astro` | 55-60 | `.roll-page` |
| `src/components/Tags.astro` | 40-46 | `.tags-container` (`is:global`) |
| `src/components/TableOfContents.astro` | 108-119 | `.toc-container` (`is:global`) |
| `src/components/LinkedMentions.astro` | 498-512 | `.mention-card-compact` |
| `src/components/LinkedMentions.astro` | 541-551 | `.mention-card-detailed` |
| `src/components/PostContent.astro` | 385-389 | `.meta-panel` |

**Action**:
1. Create a single `.card` utility class in `global.css` that represents the shared dark card pattern.
2. Remove `.featured-post` from `global.css` (exact duplicate of `.post-card`, just use `.post-card` class).
3. Remove duplicate `.post-card` definition from `PostCard.astro` scoped CSS.
4. Make `.roll-page`, `.tags-container`, `.toc-container`, `.mention-card-*` use `.card` base class.
5. Reconcile `.meta-panel` (no border, opacity bg) to either extend `.card` or become independent.

---

### C2: Consolidate Image Gallery CSS (ImageGalleryManager + ImageGallery)

**Problem**: Two files define near-identical gallery grid CSS (grid layouts, hover effects, overlays, icons, aspect ratios).

**Files**:
- `src/components/ImageGalleryManager.astro` (`is:global`, lines 142-280)
- `src/components/ImageGallery.astro` (scoped, lines 49-157)

**Action**:
1. Extract shared gallery CSS into `global.css` under a single namespace (`.image-gallery`).
2. ImageGalleryManager provides the global styles; ImageGallery removes its duplicate scoped styles.
3. Unify naming: ImageGalleryManager uses `.image-gallery-2` while ImageGallery uses `.image-gallery.grid-2`.

---

### C3: Remove Duplicated global.css Classes from Page Styles

**Problem**: `src/pages/posts/tag/[...tag]/[page].astro` (lines 212-418) redefines 16+ classes that already exist in `global.css` with slight light/dark mode variations.

**Duplicated classes** (identical to global.css):
- `.page-wrapper`, `.container-inner`, `.page-header`, `.header-row`, `.feed-buttons`, `.icon-feed`, `.icon-sm`, `.back-link-wrapper`, `.content-area`, `.mobile-sidebar`, `.desktop-sidebar`

**Near-duplicated classes** (different light/dark approach):
- `.page-title`, `.feed-button`, `.post-count`, `.tag-badge`, `.back-link`

**Action**:
1. Remove all exact-duplicate classes from `[...tag]/[page].astro`'s `<style>` block.
2. Reconcile the near-duplicate classes by updating `global.css` to handle the light/dark variants properly (global.css uses "dark-mode-first"; page uses explicit light + `.dark` modifier).
3. Move the unique classes (`.posts-list-lg`, `.sidebar-sticky-scroll`) to `global.css`.

---

## High Priority

### H1: Fix Undefined CSS Classes

**Problem**: Several classes are used in HTML but never defined in CSS.

| Class | Used In Files | Lines |
|-------|--------------|-------|
| `toc-sticky` | `podroll.astro`, `blogroll.astro` | 44 each |
| `.button-group` | `posts/[page].astro` | 174 |
| `.sidebar-sticky-scroll` | `posts/[page].astro`, `posts/tag/[...tag].astro` | 198, 190 (only defined in `posts/tag/[...tag]/[page].astro`) |

**Action**: Add these classes to `global.css`.

---

### H2: Consolidate Search Result Patterns (CommandPalette + SearchResults)

**Problem**: CommandPalette and SearchResults have 7 nearly-identical sub-patterns: section titles, result items, icons, titles, descriptions, external icon indicators, and empty state.

**Files**:
- `src/components/CommandPalette.astro`
- `src/components/SearchResults.astro`

**Action**:
1. Create shared list/result-* classes in `global.css` for the common result item pattern:
   - `.result-section-title`, `.result-item`, `.result-item-icon`, `.result-item-content`, `.result-item-title`, `.result-item-desc`, `.result-ext-icon`
2. Both components use these shared classes instead of component-prefixed ones.
3. Alternatively, extract a shared `SearchResultItem.astro` component.

---

### H3: Consolidate Empty State Pattern (global.css + CommandPalette + SearchResults)

**Problem**: Three empty state implementations with different naming but same structure.

**Files**:
- `global.css` lines 2095-2129: `.empty-state`, `.empty-state-icon`, `.empty-state-title`, `.empty-state-text`
- `CommandPalette.astro` lines 150-168: `.cp-no-results`, `.cp-no-results-icon`, `.cp-no-results-title`, `.cp-no-results-subtitle`
- `SearchResults.astro` lines 130-152: `.sr-empty`, `.sr-empty-icon`, `.sr-empty-title`, `.sr-empty-subtitle`
- `index.astro` lines 306-350: `.home-empty`, `.home-empty-icon`, `.home-empty-title`, `.home-empty-text` (duplicates `.empty-state-*`)

**Action**:
1. Extend `global.css` `.empty-state-*` classes to also support the compact variant (2rem icon, used by CommandPalette/SearchResults).
2. Add `.empty-state` class variant `.empty-state--compact` for the 2rem icon version.
3. Update CommandPalette and SearchResults to use global `.empty-state-*` classes.
4. Update `index.astro` to use `.empty-state-*` instead of `.home-empty-*`.

---

### H4: Consolidate Responsive Container Padding (5 definitions)

**Problem**: The same responsive padding pattern (1rem/1.5rem/2rem breakpoints) is defined in 5 locations.

**Files**:
- `global.css` lines 1971-1991: `.container-inner`
- `global.css` lines 2218-2231: `.layout-container`
- `Header.astro` lines 140-153: `.site-header-inner`
- `Footer.astro` lines 107-118: `.site-footer-inner`
- `PostContent.astro` lines 237-254: `.content-wrapper`

**Action**:
1. Update `.container-inner` in `global.css` to be the canonical responsive container class.
2. Change `Header.astro` to use `.container-inner` instead of `.site-header-inner`.
3. Change `Footer.astro` to use `.container-inner` instead of `.site-footer-inner`.
4. Change `PostContent.astro` to use `.container-inner` instead of `.content-wrapper`.
5. Remove duplicate definitions.

---

### H5: Move `.sidebar-sticky` to Single Definition

**Problem**: `.sidebar-sticky` is defined in both `global.css` (lines 2199-2207) and `PostContent.astro` (lines 373-383) with different values for child spacing and overflow.

**Files**:
- `global.css`: `top: 6rem; padding-bottom: 1.5rem; > * + * { margin-top: 0.75rem; }`
- `PostContent.astro`: `top: 6rem; max-height: calc(100vh - 8rem); overflow-y: auto; padding-bottom: 1.5rem; > * + * { margin-top: 1.5rem; }`

**Action**:
1. Reconcile the differences: update `global.css` to include `max-height` and `overflow-y` (more complete).
2. Remove definition from `PostContent.astro`.
3. Use `.sidebar-sticky` directly in PostContent (it already is, just its scoped styles override the global).

---

### H6: Remove `.desktop-only`/`.mobile-only` from PostContent.astro

**Problem**: `PostContent.astro` (lines 308-324) defines `.desktop-only`/`.mobile-only` identically to `global.css` (lines 2319-2337). Since PostContent uses scoped styles, these override the global ones.

**Action**: Remove `.desktop-only`/`.mobile-only` from `PostContent.astro`'s scoped `<style>`. Since PostContent is rendered within the global scope (inside `.prose`), the global classes will apply.

---

## Medium Priority

### M1: Posts Listing Page Pattern (4 near-identical files)

**Files**:
- `src/pages/posts/index.astro`
- `src/pages/posts/[page].astro`
- `src/pages/posts/tag/[...tag].astro`
- `src/pages/posts/tag/[...tag]/[page].astro`

**Shared structure**: Each has `.page-header` > `.header-row` > `.page-title` + `.feed-buttons` + `.post-count` (+ optional `.tag-badge`) + `.back-link-wrapper` + `.content-area` + posts listing + mobile sidebar + desktop sidebar.

**Action**:
1. Extract a shared `PostsPageHeader` component for the `.page-header` block.
2. Extract a shared `PostsSidebar` component for the mobile/desktop sidebar pattern.
3. This reduces 4 files from ~60-70 lines each to ~20-30 lines each.

---

### M2: RollPage Title Pattern

**Problem**: `RollPage.astro`'s `.roll-page-title` (lines 70-76) is identical to `global.css`'s `.layout-title` (lines 2310-2316).

**Action**: Change `RollPage.astro` to use `.layout-title` instead of `.roll-page-title` and remove the duplicate definition.

---

### M3: podroll.astro / blogroll.astro Structural Duplication

**Problem**: These 2 files are structurally near-identical (both use `BaseLayout` + `TableOfContents` + `RollPage` with the same TOC generation logic).

**Action**: Consider extracting a shared `RollPageLayout.astro` or having one be a wrapper around the other, but this has lower ROI since both are small files.

---

### M4: Tag Styling Inconsistency

**Problem**: Three different tag visual treatments across the codebase.

**Files**:
- `PostCard.astro` `.post-card-tag`: pill shape, 0.75rem
- `PostContent.astro` `.tag-link`: pill shape, 0.875rem  
- `Tags.astro` `.tags-item`: rounded rect, 0.875rem

**Action**: Create a unified `.tag` class in `global.css` (pill shape, 0.75rem) and update all three components to use it with optional size modifiers (`.tag--sm`, `.tag--md`).

---

### M5: Index Page Empty State Pattern

**Problem**: `index.astro` defines `.home-empty-*` (lines 306-350) which duplicates the `.empty-state-*` pattern in `global.css` (lines 2095-2129).

**Action**: Replace `.home-empty-*` classes with `.empty-state-*` from `global.css` and remove the duplicate definitions.

---

### M6: Index Page Dev Notice

**Problem**: `index.astro` `.home-dev-notice` (lines 352-371) duplicates `global.css` `.dev-notice` (lines 2140-2153).

**Action**: Use `.dev-notice` class in `index.astro` and remove `.home-dev-notice` definition.

---

## Implementation Order

| Priority | Task | Expected CSS Reduction |
|----------|------|----------------------|
| C1 | Consolidate card pattern | ~100 lines |
| C2 | Consolidate gallery CSS | ~140 lines |
| C3 | Remove duplicated page styles | ~200 lines |
| H1 | Fix undefined CSS classes | ~15 lines |
| H2 | Search result patterns | ~80 lines |
| H3 | Empty state consolidation | ~70 lines |
| H4 | Container padding consolidation | ~60 lines |
| H5 | Sidebar sticky consolidation | ~15 lines |
| H6 | Desktop/mobile utilities | ~15 lines |
| M1 | Posts page header/sidebar component | N/A (HTML only) |
| M2 | RollPage title | ~10 lines |
| M4 | Tag styling | ~30 lines |
| M5 | Index page empty state | ~25 lines |
| M6 | Index page dev notice | ~10 lines |

**Total estimated CSS reduction**: ~770 lines from component `<style>` blocks into reusable `global.css` classes.
