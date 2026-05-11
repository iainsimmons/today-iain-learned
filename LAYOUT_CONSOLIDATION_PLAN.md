# Layout Consolidation Plan

## Goal
Reduce duplication in HTML and CSS by consolidating common layout structures into reusable components and common class names.

## Steps

### Step 1: Define Unified CSS
- **Action**: Create unified structural classes in `src/styles/global.css` for layout components.
- **Status**: ✅ Completed
  - Added classes: `.layout-wrapper`, `.layout-container`, `.layout-article`, `.layout-article--cover`, `.layout-image-wrap`, `.layout-image`, `.layout-content`, `.layout-content--with-image`, `.layout-sidebar`, `.layout-sidebar-inner`, `.layout-sidebar-inner--toc`.
  - Removed CSS cascade layers as requested.

### Step 2: Refactor Layouts to Use Unified CSS
- **Action**: Update `BaseLayout.astro`, `PostLayout.astro`, and `PageLayout.astro` to use the unified classes and remove duplicate CSS and scripts.
- **Status**: 
  - `BaseLayout.astro`: ✅ Completed
    - Changed `<main class="main-content">` to `<main class="main-content layout-container">`.
  - `PostLayout.astro`: ✅ Completed
    - Replaced `pol-wrapper` with `layout-wrapper`.
    - Replaced `pol-container` (removed entirely, as container is now in BaseLayout).
    - Replaced `pol-article` with `layout-article`.
    - Replaced `pol-article--cover` with `layout-article--cover`.
    - Replaced `pol-image-wrap` with `layout-image-wrap`.
    - Replaced `pol-image` with `layout-image`.
    - Replaced `pol-content` with `layout-content`.
    - Replaced `pol-content--cover` with `layout-content--with-image`.
    - Replaced `pol-content--no-cover` with `layout-content` (no change needed for no-cover case, as base layout-content is used).
    - Updated sidebar classes:
      - `pol-sidebar` → `layout-sidebar`
      - `pol-sidebar-inner` → `layout-sidebar-inner`
      - `pol-sidebar-inner--toc` → `layout-sidebar-inner--toc`
    - Added CSS for sidebar classes in `global.css` (see Step 1).
  - `PageLayout.astro`: ✅ Completed
    - Replaced `pl-wrapper` with `layout-wrapper`.
    - Replaced `pl-container` (removed entirely, as container is now in BaseLayout).
    - Replaced `pl-article` with `layout-article`.
    - Replaced `pl-article--cover` with `layout-article--cover`.
    - Replaced `pl-image-wrap` with `layout-image-wrap`.
    - Replaced `pl-image` with `layout-image`.
    - Replaced `pl-content` with `layout-content`.
    - Replaced `pl-content--with-image` with `layout-content--with-image`.
    - Updated sidebar classes:
      - `pl-sidebar` → `layout-sidebar`
      - `pl-sticky` → `layout-sidebar-inner` (with position: sticky)
    - Removed duplicate script block (external links and table wrapping) and rely on the utility.

### Step 3: Standardize Interface and Scripts
- **Action**: Create a shared utility script for layout-specific initialization (external links, table wrappers) and remove duplicate scripts from layouts.
- **Status**: ✅ Completed
  - Created `src/utils/layout.ts` with function `initializeLayout()`.
  - This function handles:
    - Setting `target="_blank"` and `rel="noopener noreferrer"` on external links in `.prose`.
    - Wrapping tables in `.prose` with a `.table-wrapper` div.
  - Removed duplicate `DOMContentLoaded` scripts from `PostLayout.astro` (the scripts for external links and table wrapping are now handled by the utility).
  - Note: The `initializeImageGrids` function and its call were removed as per instructions and not included in the utility.

### Step 4: Remove HTML Comments from .astro files
- **Action**: Remove all HTML comments (<!-- ... -->) from .astro files to reduce clutter and potential duplication.
- **Status**: ⏳ Pending

## Files Modified
- `src/styles/global.css`: Added unified layout component classes.
- `src/layouts/BaseLayout.astro`: Added `layout-container` to main element.
- `src/layouts/PostLayout.astro`: 
  - Replaced all `pol-` prefixed classes with `layout-` equivalents.
  - Updated sidebar classes.
  - Removed duplicate script block (external links and table wrapping) and rely on the utility.
- `src/layouts/PageLayout.astro`: 
  - Replaced all `pl-` prefixed classes with `layout-` equivalents.
  - Updated sidebar classes.
  - Removed duplicate script block (external links and table wrapping) and rely on the utility.
- `src/utils/layout.ts`: Created with `initializeLayout()` function.

## Next Steps
1. Remove HTML comments from .astro files (Step 4).
2. Verify that the changes do not break the layout or functionality.
3. Consider if any other duplicated CSS or HTML can be consolidated (e.g., header, footer, or other components).