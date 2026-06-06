---
title: Better code blocks with the Astro Expressive Code integration
date: 2026-04-03
description: "today iain learned: How to build better and more accessible code blocks with the Astro Expressive Code integration"
tags:
  - webdev
  - HTML
  - CSS
  - Astro
  - accessibility
  - a11y
hideTOC: false
draft: false
aliases:
atUri: "at://did:plc:aoqs4f5ru6ztomatyvept7bf/site.standard.document/3mnlsxsfsn325"
---
Prior to this week I was using the default [Shiki](https://shiki.style/) integration that comes out of the box with [Astro](https://astro.build/), for [syntax highlighting and styling code blocks in Markdown files](https://docs.astro.build/en/guides/syntax-highlighting/#markdown-code-blocks).

I had also added my own little tweaks, including a <strong style="color: cyan">cyan</strong>-coloured border and the language displayed in the top right in <strong style="color: gold">gold</strong>. Here's the CSS for that:

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

And that looked like this:
![[attachments/old-code-block.png|Old code block styles]]

That's not bad, but one feature that I really felt was missing was the ability to copy the code from a code block.

I was inspired/moved by [Salma Alam-Naylor's](https://whitep4nth3r.com/about/) experience having to write code and operate a web browser with only her voice, and how the simple thing of being able to [copy the contents of a code block](https://whitep4nth3r.com/blog/how-to-build-a-copy-code-snippet-button/) with one "click" made such a huge difference to her when she was temporarily disabled.

I thought of building one myself, but as with many things in the Astro ecosystem, I assumed someone had already built a better solution. A [quick search of the integrations](https://astro.build/integrations/?search=syntax+highlight) led me to [Expressive Code](https://expressive-code.com/).

It puts Astro first in its list of framework integrations, which was already a good sign!

And it was of course super-easy to install:

```sh
pnpm astro add astro-expressive-code
```

Then I just configured it with some slight modifications to the default options, picking my go-to theme of Tokyo Night and matching the font used on this site, JetBrains Mono:

```js title="astro.config.mjs"
import { defineConfig, fontProviders } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
// ...
import expressiveCode from "astro-expressive-code";

export default defineConfig({
// ...
  integrations: [
    tailwind(),
    sitemap(),
    expressiveCode({
      themes: ["tokyo-night"],
      styleOverrides: {
        codeBackground: "#1a1b26",
        codeFontFamily: "var(--font-jetbrains-mono)",
        uiFontFamily: "var(--font-jetbrains-mono)",
      },
    }),
    mdx(),
  ],
// ...
});
```

And lastly I further tweaked the CSS so any older code block styles were removed and did not conflict. The main part being to unset some other CSS added by the [Astro Modular](https://github.com/davidvkimball/astro-modular) template I'm using:

```css title="src/styles/global.css"
pre code {
  background-color: unset !important;
}
```

And the result is ... well, you can see it in the code blocks on this post! 🙂