# Layout Consolidation Plan

## Goal
Reduce duplication in HTML and CSS by consolidating common layout structures into reusable components and common class names.

## Completed Steps

### Step 1: Define Unified CSS
- **Action**: Create unified structural classes in `src/styles/global.css` for layout components.
- **Status**: ✅ Completed
  - Added classes: `.layout-wrapper`, `.layout-container`, `.layout-article`, `.layout-article--cover`, `.layout-image-wrap`, `.layout-image`, `.layout-content`, `.layout-content--with-image`, `.layout-sidebar`, `.layout-sidebar-inner`, `.layout-sidebar-inner--toc`.
  - Removed CSS cascade layers as requested.

### Step 2: Refactor Layouts to Use Unified CSS
- **Action**: Update `BaseLayout.astro`, `PostLayout.astro`, and `PageLayout.astro` to use the unified classes and remove duplicate CSS and scripts.
- **Status**: ✅ Completed
  - `BaseLayout.astro`: Added `layout-container` to main element.
  - `PostLayout.astro`:
    - Replaced all `pol-*` classes with `layout-*` equivalents in HTML.
    - Removed dead CSS blocks (`.pol-wrapper`, `.pol-container`, `.pol-article`, `.pol-image-wrap`, `.pol-image`, `.pol-content`, `.pol-content--cover`, `.pol-content--no-cover`, `.pol-header`, `.pol-title`, `.pol-desktop`, `.pol-mobile`, `.pol-sidebar`, `.pol-sidebar-inner`, `.pol-sidebar-inner--toc`).
    - Kept post-specific styles (`.pol-meta`, `.pol-tags`, `.pol-tag`, `.pol-nav*`, `.pol-comments`).
  - `PageLayout.astro`:
    - Replaced all `pl-*` classes with `layout-*` equivalents in HTML.
    - Removed dead CSS blocks (`.pl-wrapper`, `.pl-container`, `.pl-article`, `.pl-image-wrap`, `.pl-image`, `.pl-content`, `.pl-content--with-image`, `.pl-header`, `.pl-title`, `.pl-sidebar`, `.pl-sticky`).
    - Kept only `.pl-article--cover { overflow: hidden; }` (no global equivalent).

### Step 3: Standardize Interface and Scripts
- **Action**: Create a shared utility script for layout-specific initialization (external links, table wrappers) and remove duplicate scripts from layouts.
- **Status**: ✅ Completed
  - Created `src/utils/layout.ts` with function `initializeLayout()`.
  - Removed duplicate `DOMContentLoaded` scripts from `PostLayout.astro` and `PageLayout.astro`.

### Step 4: Remove HTML Comments from .astro files
- **Action**: Remove all HTML comments (`<!-- ... -->`) from .astro files to reduce clutter and potential duplication.
- **Status**: ✅ Completed
  - `BaseLayout.astro`: Removed 17 HTML comments.
  - `PostLayout.astro`: Removed 12 HTML comments.
  - `PageLayout.astro`: Removed 6 HTML comments.

## Further Consolidation: New Shared Classes Added to global.css

### `.layout-header` and `.layout-title`
- **Source**: Identical styles in `PostLayout.astro` (`.pol-header`/`.pol-title`) and `PageLayout.astro` (`.pl-header`/`.pl-title`).
- **Status**: ✅ Added to `global.css`, both layouts now use `layout-header`/`layout-title`.

### `.desktop-only` and `.mobile-only`
- **Source**: Duplicated responsive display toggle pattern across `PostLayout.astro` (`.pol-desktop`/`.pol-mobile`), `PostContent.astro` (`.desktop-only`/`.mobile-only`), and `PostCard.astro` (`.post-card-date-desktop`/`-mobile` etc.).
- **Status**: ✅ Added to `global.css`, `PostLayout.astro` now uses them.

## Files Modified

| File | Changes |
|------|---------|
| `src/styles/global.css` | Added `.layout-header`, `.layout-title`, `.desktop-only`, `.mobile-only`, unified layout classes |
| `src/layouts/BaseLayout.astro` | Added `layout-container` to main, removed HTML comments |
| `src/layouts/PostLayout.astro` | Replaced all `pol-*` classes with `layout-*` equivalents, removed dead CSS, removed HTML comments |
| `src/layouts/PageLayout.astro` | Replaced `pl-*` classes with `layout-*`, removed dead CSS, removed HTML comments |
| `src/utils/layout.ts` | Created with `initializeLayout()` function |

## CSS Reduction Summary

- **PostLayout.astro `<style>` block**: ~312 lines → ~167 lines (removed ~145 lines of dead/duplicate CSS)
- **PageLayout.astro `<style>` block**: ~112 lines → ~4 lines (removed ~108 lines of dead/duplicate CSS)
- **global.css additions**: ~40 lines of shared utility classes
- **Net reduction**: ~213 lines of CSS removed from component `<style>` blocks

## Next Steps

See `LAYOUT_CONSOLIDATION_PLAN_PHASE2.md` for the next phase of consolidation.
