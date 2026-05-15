# Future Layout Consolidation Opportunities

Found during Phase 2 implementation — items not in the original plan that could further reduce duplication.

---

## F1: `.home-title` Duplicates `.layout-title` (index.astro)

**Location**: `src/pages/index.astro` lines 236-246

**Problem**: `.home-title` has identical properties to global `.layout-title` (1.25rem, font-weight 700, color primary-50, margin-bottom 1.5rem, line-height 1.25) plus a light-mode color override in `:root:not(.dark)`.

**Files involved**: 1 (index.astro)

**Lines**: ~12

**Action**: Replace with `.layout-title` class in HTML. The light-mode override is unnecessary (dark-mode-first project).

---

## F2: `.home-section-title` Near-Duplicate of `.layout-title` (index.astro)

**Location**: `src/pages/index.astro` lines 263-271

**Problem**: `.home-section-title` (1.125rem, font-weight 600, color primary-50) is a smaller variant of `.layout-title` (1.25rem, 700). Also has light-mode override.

**Lines**: ~10

**Action**: Could add a `.layout-title--sm` modifier, or leave as-is since only used once.

---

## F3: `.layout-container` vs `.container-inner` Duplication

**Location**: `src/styles/global.css`

- `.container-inner` (line ~1945): `margin: auto; max-width: var(--container-max-width); position: relative; padding: 0 1rem;` with responsive breakpoints
- `.layout-container` (line ~2200): `margin: auto; padding: 1rem; position: relative;` with responsive breakpoints

**Problem**: Both define responsive container patterns with the same breakpoints but slightly different values. `.container-inner` has `max-width` and `position: relative`; `.layout-container` uses `padding` shorthand instead of left/right.

**Lines**: ~20

**Action**: Either eliminate `.layout-container` in favor of `.container-inner`, or vice versa. Check usage of `.layout-container` (likely in PostLayout/PageLayout).

---

## F4: `CommandPalette.astro` — JS-Generated HTML Classes

**Location**: `src/components/CommandPalette.astro`

**Problem**: Multiple CSS classes are only used in JS-generated HTML (`.command-palette-item`, `.cp-result-item-search`, etc.) and have no equivalent global classes. Component defines ~150 lines of scoped CSS.

**Lines**: ~150

**Action**: The most impactful remaining refactor. Convert CommandPalette to use shared `.result-item-*` and `.empty-state--compact` classes from `global.css`. Requires updating both the Astro template and the inline `<script>` JS code. Higher risk due to client-side rendering.

**Estimated reduction**: ~80-100 lines

---

## F5: `Tags.astro` `.tags-item` — Visual Alignment with `.tag`

**Location**: `src/components/Tags.astro`

**Problem**: `.tags-item` uses rounded-rect style (border-radius: 0.375rem, 0.875rem font), while the new unified `.tag` class uses pill shape (border-radius: 9999px, 0.75rem font). These serve different contexts (sidebar vs inline), but the inconsistency may be intentional or accidental.

**Lines**: ~30

**Action**: If sidebar tags should match inline tags, update `.tags-item` to use `.tag` class with size modifier. If they should remain visually distinct (sidebar is smaller, denser), document the rationale.

---

## F6: `.toc-sticky` Duplicates `.sidebar-sticky` Pattern

**Location**: `src/pages/podroll.astro`, `src/pages/blogroll.astro`

**Problem**: `.toc-sticky` (position: sticky, top: 6rem, padding-bottom: 1.5rem) is identical to the base `.sidebar-sticky` properties. Used in a wrapper div inside `.toc-sidebar`.

**Lines**: ~5

**Action**: Replace `.toc-sticky` with `.sidebar-sticky` class. Note: `.sidebar-sticky` now has `max-height` and `overflow-y` which may not be desired in this context — but since it wraps the TOC component (which handles its own overflow), it should be fine.

---

## Summary Table

| Item | Location | Lines | Impact | Action |
|------|----------|-------|--------|--------|
| F1 | index.astro `.home-title` | ~12 | Low | Replace with `.layout-title` |
| F2 | index.astro `.home-section-title` | ~10 | Low | Add `.layout-title--sm` or leave |
| F3 | global.css `.layout-container` | ~20 | Medium | Consolidate with `.container-inner` |
| F4 | CommandPalette.astro | ~100 | High | Migrate to shared `.result-item-*`/`.empty-state--compact` |
| F5 | Tags.astro `.tags-item` | ~30 | Low | Align with `.tag` or document rationale |
| F6 | podroll/blogroll `.toc-sticky` | ~5 | Low | Replace with `.sidebar-sticky` |

**Total estimated additional reduction**: ~170 lines
