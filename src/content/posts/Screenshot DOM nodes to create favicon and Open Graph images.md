---
title: Screenshot DOM nodes to create favicon and Open Graph images
date: 2026-02-21
description: "today iain learned: Screenshot DOM nodes to create favicon and Open Graph images"
tags:
  - CSS
  - browser
  - images
  - webdev
  - HTML
hideTOC: false
draft: false
aliases:
---
While building out this blog, I realised I hadn't thought much about branding beyond the name "today iain learned" (a personal spin on "Today I Learned" or TIL) and didn't have a favicon or other images for sharing on social media (not that I'm very active on any social networks at the moment).

I had sort of settled on a (default) dark theme with black, dark grey and a deep royal purple accent colour (from the appropriately named "Obsidian" theme from [Astro Modular](https://github.com/davidvkimball/astro-modular)) and a monospace font (the classic [JetBrains Mono](https://www.jetbrains.com/lp/mono/)), but my graphic design skills are not the greatest.

So I fell back to something I _am_ familiar with, web development. I first thought I would just build it out on the page with what was already there and then take a screenshot, crop it, and do all that, but I remembered (I think from a [Syntax.fm](https://syntax.fm/) podcast episode) that it's possible to take a screenshot from a [DOM](https://developer.mozilla.org/en-US/docs/Glossary/DOM) node (at least in Chromium-based browsers, I'm not sure about others).

I started with the site title you can see in the header on this site. Then I made it way bigger, removed a bunch of other content from the page, upped the font and used the hover/accent purple colour for my name, and threw the cyan border colour that I've added to code blocks:

```
like this one…
```

Then I simply used the [Capture node screenshot](https://developer.chrome.com/docs/devtools/dom#screenshot) command in the Elements panel of Chromium DevTools (I'm using the [Helium Browser](https://helium.computer/) on my Linux computer) and with a bit of trial and error, tweaking the margins/padding to get just the right size, I got the result I was looking for, the [Open Graph](https://ogp.me/) image shown below:

![[attachments/open-graph-image-for-today-iain-learned.png|Open Graph image for today iain learned]]

Then a little more tweaking to keep just the initials and crop to a square, without a border and I had my [favicon](https://developer.mozilla.org/en-US/docs/Glossary/Favicon):

![[attachments/favicon-til.png|favicon with initials TIL in lowercase]]

Finally, I replaced the existing image files used on this blog, pushed the changes and cleared the Cloudflare cache, and pretty quickly they were up and running.

You could use this for any number of different cases where you need to quickly generate some graphics without having to use a dedicated tool.

Also see [Chrome DevTools Tips - 4 ways to capture screenshots with DevTools](https://developer.chrome.com/blog/devtools-tips-33) if you prefer learning with video content.

