---
title: Walker + Elephant = Raycast on Linux
description: "today iain learned: Walker + Elephant = Raycast on Linux"
date: 2025-10-29
tags:
  - linux
  - tools
  - workflow
---
I'm running [Omarchy](https://omarchy.org) on my personal PC and macOS for work and I was missing Raycast.

I was aware that Omarchy started with [rofi](https://github.com/davatorium/rofi) as the basic app launcher and then later switched to [Walker](https://github.com/abenz1267/walker) and implemented the [menu](https://learn.omacom.io/2/the-omarchy-manual/51/navigation) with it, but today I learned that (together with Elephant) it can do and contains so much more, including (prefixes as defined by Omarchy, use `/` to see all providers):

- clipboard history/search (prefix: `$`)
- calculator/unit conversion (prefix: `=`)
- file search, with preview (prefix: `.`)
- emoji picker (prefix: `:`)
- unicode search
- bluetooth devices (connect/disconnect/pair)
- command runner (execute arbitrary commands in your `PATH`)
- to-do list
- web search (like custom search engines in browsers, pass in the search parameter, prefix: `@`)

So I implemented a custom web search for [Phind](https://phind.com) like so (using the Google one as an example):
`~/.config/elephant/websearch.toml`

```toml
[[entries]]
default = false
name = "Phind"
prefix = "dev"
url = "https://phind.com/search?q=%TERM%"
```

And you could do something similar to search other sites like GitHub:

```toml
[[entries]]
default = false
name = "GitHub"
prefix = "gh"
url = "https://github.com/search?q=%TERM%&type=repositories"
```
