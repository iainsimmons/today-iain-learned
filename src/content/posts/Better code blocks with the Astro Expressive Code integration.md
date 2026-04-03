---
title: Better code blocks with the Astro Expressive Code integration
date: 2026-04-03
description: "today iain learned: Better code blocks with the Astro Expressive Code integration"
tags: []
hideTOC: false
draft: true
aliases:
  - better-code-blocks-with-the-astro-expressive-code-integration
---
Prior to this week I was using the default [Shiki](https://shiki.style/) integration that comes out of the box with [Astro](https://astro.build/), for [syntax highlighting and styling code blocks in Markdown files](https://docs.astro.build/en/guides/syntax-highlighting/#markdown-code-blocks).

I had also added my own little tweaks, including a <strong style="color: cyan">cyan</strong>-coloured border and the language displayed in the top right in <strong style="color: gold">gold</strong>:

```css title="src/styles/global.css"
.astro-code,
pre.astro-code {
  border-color: cyan;
  border-width: 1px;

  &:not([data-language="plaintext"]) {
    /* Damn you !important, making me override with more !important */
    padding: 1.5rem 1.5rem 1rem 1rem !important;
    position: relative;

    &::after {
      content: attr(data-language);
      position: absolute;
      inset: 0 0.25rem auto auto;
      z-index: 10;
      color: gold;
    }
  }
}
```
