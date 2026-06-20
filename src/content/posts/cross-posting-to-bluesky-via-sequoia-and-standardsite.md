---
title: Cross-posting to Bluesky via Sequoia and Standard.site
date: 2026-06-19
description: "today iain learned: How to cross-post blog posts to Bluesky and the Atmosphere via Sequoia, Standard.site and the AT Protocol"
tags:
  - blog
  - Bluesky
  - Atmosphere
  - webdev
  - CLI
  - tools
  - workflow
  - atproto
hideTOC: false
draft: false
atUri: "at://did:plc:aoqs4f5ru6ztomatyvept7bf/site.standard.document/3mon4talwjp2b"
---
After watching the [atproto episode of the CodeTV Web Dev Challenge (Season 3, Episode 4)](https://www.youtube.com/watch?v=S-XytKfGCO8) I was inspired to connect my blog site to the [Atmosphere](https://atproto.com/guides/glossary#atmosphere) and specifically the [Standard.site lexicon](https://standard.site), especially since [Bluesky now embeds Standard.site links automatically](https://atproto.com/blog/standard-site-bluesky-timeline).

Here's what they look like:

![[attachments/standard.site-post-on-bluesky.png|Standard.site post embedded on Bluesky]]

The [atproto team wrote a companion blog post to the video](https://atproto.com/blog/atmospheric-website) and listed a few tools for doing this. The first one listed is [Sequoia](https://sequoia.pub), which I was delighted to find out was built and is maintained by [Steve Simkins](https://stevedylan.dev/), a fellow dev / terminal / Neovim fan that I'm connected to on a few Discord servers and communities.

I had no idea what to expect, but honestly Sequoia makes the whole process of connecting your site and blog posts to Standard.site / atproto so *easy*. 5 steps in the [Quickstart guide](https://sequoia.pub/quickstart) and you're up and running!

I won't repeat the steps here because the [Sequoia site and guide](https://sequoia.pub/quickstart)  does a great job of explaining things, and also looks fantastic with the nice forest green accent colour!

I did do a little bit of extra hacking around to also include some other content, but that could also be done as a more manual process if you want control over that. Jason Lengstorf explains a bit more about that on the CodeTV blog post [How to publish multiple Standard Site publications on one domain](https://codetv.dev/blog/multiple-standard-site-publications-on-one-website).

If you'd like to know more about the AT Protocol, I'd recommend starting with the [Understanding Atproto](https://atproto.com/guides/understanding-atproto) guide.