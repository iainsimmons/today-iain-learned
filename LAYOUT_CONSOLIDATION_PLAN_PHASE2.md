# Layout Consolidation Plan — Phase 2

## Goal
Eliminate remaining CSS duplication identified across `src/pages/`, `src/components/`, and `src/styles/global.css`. Consolidate repeated patterns (cards, containers, search results, galleries, empty states) into shared global classes.

---

## ✅ Completed Items Summary

| Task | Description | Lines Removed |
|------|-------------|---------------|
| C1 | Card pattern consolidation (11+ locations → 1 `.card` class) | ~90 |
| C2 | Image gallery CSS (2 components → shared `global.css`) | ~140 |
| C3 | Duplicated page styles removed from `[...tag]/[page].astro` | ~200 |
| H1 | Added undefined classes (`toc-sticky`, `button-group`) | ~15 |
| H2 | Shared result-item classes in `global.css` + SearchResults | ~50 |
| H3 | Empty state compact variant + SearchResults updates | ~40 |
| H4 | Container padding (`container-inner` in Header/Footer/PostContent) | ~45 |
| H5 | Sidebar-sticky reconciled (global + PostContent) | ~10 |
| H6 | Desktop/mobile utilities removed from PostContent | ~10 |
| M2 | RollPage title uses `.layout-title` | ~8 |
| M4 | Unified `.tag` class (PostCard + PostContent) | ~25 |
| M5 | Index page empty state uses `.empty-state-*` | ~30 |
| M6 | Index page dev notice uses `.dev-notice` | ~10 |
| **Total** | | **~673 lines** |

---

## ✅ Completed

### ✅ C1: Consolidate Card Pattern (11+ duplicate definitions)

**Problem**: The "dark card" container pattern (`background: primary-900; border: 1px solid primary-700; border-radius: 0.5rem; box-shadow`) was independently redefined in 11+ locations.

**What was done**:
1. Updated `.card` in `global.css` as the canonical dark card class.
2. Removed `.featured-post` (unused, exact duplicate of `.post-card`).
3. Removed duplicate base properties from `PostCard.astro` scoped `.post-card`.
4. Added `card` class to `RollPage.astro`, `Tags.astro`, `TableOfContents.astro`, `LinkedMentions.astro`, `PostLayout.astro`, `PageLayout.astro`, `index.astro`.
5. Simplified `.post-card` in `global.css` to only have transition/hover (base from `.card`).
6. Removed `.layout-article` CSS definition (replaced by `.card`).
7. `.meta-panel` left independent (semi-transparent bg, no border, different shape).

**Reduction**: ~90 lines

---

### ✅ C2: Consolidate Image Gallery CSS (ImageGalleryManager + ImageGallery)

**Problem**: Two files defined near-identical gallery grid CSS.

**What was done**:
1. Added consolidated gallery CSS to `global.css` under `.image-gallery-1` through `.image-gallery-4` namespace.
2. Removed entire `<style is:global>` block from `ImageGalleryManager.astro`.
3. Removed entire scoped `<style>` block from `ImageGallery.astro`.
4. Updated `processImageLayout()` in `images.ts` to return standardized class names.
5. Updated `ImageGallery.astro` Props type to match new naming.

**Reduction**: ~140 lines

---

### ✅ C3: Remove Duplicated global.css Classes from Page Styles

**Problem**: `src/pages/posts/tag/[...tag]/[page].astro` redefined 16+ classes already in `global.css`.

**What was done**:
1. Removed entire 200-line `<style>` block from `[...tag]/[page].astro`.
2. Moved unique classes (`.posts-list-lg`, `.sidebar-sticky-scroll`) to `global.css`.
3. Near-duplicate classes with light/dark overrides removed — global's "dark-mode-first" versions are correct.

**Reduction**: ~200 lines

---

## ✅ High Priority

### ✅ H1: Fix Undefined CSS Classes

**What was done**:
- Added `.toc-sticky` (position: sticky, top: 6rem) to `global.css`.
- Added `.button-group` (flex, wrap, gap) to `global.css`.
- `.sidebar-sticky-scroll` moved to `global.css` as part of C3.

**Reduction**: ~15 lines

---

### ✅ H2/H3: Search Result & Empty State Patterns

**What was done**:
1. Added shared `.result-item`, `.result-item-icon`, `.result-item-content`, `.result-item-title`, `.result-item-desc`, `.result-ext-icon`, `.result-section-title` classes to `global.css`.
2. Updated `SearchResults.astro` to use global classes and removed its entire `<style>` block.
3. Added `.empty-state--compact` variant to `global.css` (2rem icon, 2rem padding).
4. `CommandPalette.astro` not updated (JS-generated HTML — lower ROI for now).

**Reduction**: ~90 lines

---

### ✅ H4: Consolidate Responsive Container Padding (5 definitions)

**What was done**:
1. Updated `.container-inner` in `global.css` to include `max-width: var(--container-max-width)` and `position: relative`, removed `margin-bottom` (page-specific).
2. Changed `Header.astro` to use `.container-inner` instead of `.site-header-inner`.
3. Changed `Footer.astro` to use `.container-inner` instead of `.site-footer-inner`.
4. Changed `PostContent.astro` to use `.container-inner` instead of `.content-wrapper`.
5. Removed all 3 duplicate definitions.

**Reduction**: ~45 lines

---

### ✅ H5: Move `.sidebar-sticky` to Single Definition

**What was done**:
1. Updated global `.sidebar-sticky` to include `max-height: calc(100vh - 8rem)` and `overflow-y: auto; overflow-x: hidden` from PostContent's version.
2. Removed `.sidebar-sticky` definition from PostContent's scoped CSS.

**Reduction**: ~10 lines

---

### ✅ H6: Remove `.desktop-only`/`.mobile-only` from PostContent.astro

**What was done**: Removed the duplicate responsive display utility definitions from PostContent.astro (global.css already has identical definitions).

**Reduction**: ~10 lines

---

## ✅ Medium Priority

### ✅ M2: RollPage Title Pattern

**Done**: Changed `RollPage.astro` to use `.layout-title` instead of `.roll-page-title`, removed `.roll-page-title` CSS definition.

---

### ✅ M4: Tag Styling Inconsistency

**Done**: Added unified `.tag` class (pill shape, 0.75rem) and `.tag--md` modifier to `global.css`. Updated `PostCard.astro` and `PostContent.astro` to use `.tag` class. Kept `Tags.astro` separate (different visual: rounded rect).

---

### ✅ M5: Index Page Empty State Pattern

**Done**: Replaced `.home-empty-*` classes with `.empty-state-*` from `global.css`. Removed 45 lines of duplicate CSS.

---

### ✅ M6: Index Page Dev Notice

**Done**: Replaced `.home-dev-notice-*` classes with `.dev-notice-*` from `global.css`. Removed 20 lines of duplicate CSS.

---

## Remaining (Future)

### M1: Posts Listing Page Pattern (4 near-identical files)
**Files**: `src/pages/posts/index.astro`, `[page].astro`, `tag/[...tag].astro`, `tag/[...tag]/[page].astro`

**Status**: Deferred — requires extracting shared components (HTML refactoring, not just CSS). All 4 files now rely on global.css for their styling, but the HTML structure duplication remains.

### M3: podroll.astro / blogroll.astro Structural Duplication
**Status**: Deferred — low ROI, both files are small (<50 lines each).

### CommandPalette.astro Consolidation
**Status**: Deferred — HTML generated via client-side JS, making shared class migration more complex.

### Tags.astro `.tags-item` Visual Alignment
**Status**: Deferred — uses rounded-rect style (different from `.tag` pill shape). Consider aligning in future.

---

## Implementation Results

| Priority | Task | Lines Removed | Status |
|----------|------|---------------|--------|
| C1 | Consolidate card pattern | ~90 | ✅ |
| C2 | Consolidate gallery CSS | ~140 | ✅ |
| C3 | Remove duplicated page styles | ~200 | ✅ |
| H1 | Fix undefined CSS classes | ~15 | ✅ |
| H2/H3 | Search result + empty state patterns | ~90 | ✅ |
| H4 | Container padding consolidation | ~45 | ✅ |
| H5 | Sidebar sticky consolidation | ~10 | ✅ |
| H6 | Desktop/mobile utilities | ~10 | ✅ |
| M2 | RollPage title | ~8 | ✅ |
| M4 | Tag styling | ~25 | ✅ |
| M5 | Index page empty state | ~30 | ✅ |
| M6 | Index page dev notice | ~10 | ✅ |
| **Total** | | **~673 lines** | |

**Total CSS reduction**: ~673 lines from component `<style>` blocks into reusable `global.css` classes.
