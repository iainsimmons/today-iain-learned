---
title: Adding an animated card border glow with CSS
date: 2026-04-21
description: "today iain learned: How to add an animated card border glow with CSS"
tags:
  - CSS
  - webdev
hideTOC: false
draft: true
aliases:
---
I recently saw a nice top border glow effect from a site shared on the [Astro blog post from March](https://astro.build/blog/whats-new-march-2026/#community), coincidentally made by [David V Kimball](https://davidvkimball.com/), author of the [Astro Modular](https://github.com/davidvkimball/astro-modular) template used to build this site. The site is no longer up (it was built for a challenge), but I nabbed a screenshot and used that as a reference:

![[attachments/border-glow-reference-screenshot.png|Reference screenshot for the border glow effect]]


I think I've seen this before, maybe in a Kevin Powell or Wes Bos YouTube video, and I straight away thought of using a [radial gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/gradient/radial-gradient).

My initial implementation used a `::before` pseudo-element and had a simple `opacity` transition on `:hover` / `:focus-within` :

```css
.border-glow-top {
	--border-glow-color: rgb(var(--color-highlight-500));
	position: relative;
	overflow: hidden;
}

.border-glow-top::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 3px;
	background: radial-gradient(
		ellipse 50% 100% at 50% 0%,
		var(--border-glow-color) 0%,
		transparent 100%
	);
	opacity: 0;
	transition: opacity 0.3s ease;
}

.dark .border-glow-top::before {
	--border-glow-color: rgb(var(--color-highlight-400));
}

.border-glow-top:hover::before,
.border-glow-top:focus-within::before {
	opacity: 1;
}
```

That was fine, but I wanted a few other features:
1. A persistent border glow on the post article container element, so that it wouldn't change opacity during the view transitions from clicking a post card on the homepage to the article view.
2. An animation, rather than a transition, for the glow to expand out from the centre to its full width (50% width of the container element)

https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property / https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Properties_and_values_API/Registering_properties
Note Baseline status Newly Available

https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@keyframes


https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation


```css
  @property --border-glow-width {
    syntax: "<percentage>";
    inherits: true;
    initial-value: 0%;
  }

  @keyframes widen-border-glow {
    0% {
      --border-glow-width: 0%;
    }
    100% {
      --border-glow-width: 50%;
    }
  }

  .border-glow-top {
    --border-glow-color: rgb(var(--color-highlight-500));
    position: relative;
  }

  .border-glow-top::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: radial-gradient(
      ellipse var(--border-glow-width) 100% at 50% 0%,
      var(--border-glow-color) 0%,
      transparent 100%
    );
  }

  .dark .border-glow-top::before {
    --border-glow-color: rgb(var(--color-highlight-400));
  }

  .border-glow-top:not(.border-glow-top-permanent):hover::before,
  .border-glow-top:not(.border-glow-top-permanent):focus-within::before {
    animation: widen-border-glow 0.2s forwards;
  }

  .border-glow-top-permanent {
    --border-glow-width: 50%;
  }
```