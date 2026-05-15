# Future Layout Consolidation Opportunities

Found during Phase 2 implementation — items not in the original plan that could further reduce duplication, plus deferred items.

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

**Problem**: Both define responsive container patterns with the same breakpoints but slightly different values.

**Lines**: ~20

**Action**: Either eliminate `.layout-container` in favor of `.container-inner`, or vice versa.

---

## F4: `CommandPalette.astro` — JS-Generated HTML Classes

**Problem**: Command palette generates HTML via client-side JavaScript, making shared CSS class migration complex. ~150 lines of scoped CSS.

**Lines**: ~100

**Action**: Highest ROI remaining. Convert to use shared `.result-item-*` and `.empty-state--compact` from `global.css`. Higher risk due to client-side rendering.

---

## F5: `.toc-sticky` Duplicates `.sidebar-sticky` Pattern

**Location**: `src/pages/[rolltype].astro`

**Problem**: `.toc-sticky` (position: sticky, top: 6rem) is essentially `.sidebar-sticky`.

**Lines**: ~5

**Action**: Replace `.toc-sticky` with `.sidebar-sticky` class.

---

## Summary Table

| Item | Location | Lines | Impact | Action |
|------|----------|-------|--------|--------|
| F1 | index.astro `.home-title` | ~12 | Low | Replace with `.layout-title` |
| F2 | index.astro `.home-section-title` | ~10 | Low | Add `.layout-title--sm` or leave |
| F3 | global.css `.layout-container` | ~20 | Medium | Consolidate with `.container-inner` |
| F4 | CommandPalette.astro | ~100 | High | Migrate to shared classes |
| F5 | [rolltype].astro `.toc-sticky` | ~5 | Low | Replace with `.sidebar-sticky` |

**Total estimated additional reduction**: ~150 lines

---

## Pre-existing Build Issue

**Issue**: Remote image redirect error during `astro build`:
```
Error: Failed to load remote image https://github.com/gaearon.png. The request was redirected.
```

**Potential fix**: Update stargazed data to use non-redirected image URLs, or configure Astro to skip/allow redirects for remote images.
