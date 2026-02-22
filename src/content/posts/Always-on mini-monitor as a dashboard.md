---
title: Always-on mini-monitor as a dashboard
date: 2026-02-22
description: "today iain learned: Always-on mini-monitor as a dashboard"
tags: []
hideTOC: false
draft: true
aliases:
  - always-on-mini-monitor-as-a-dashboard
---
Recently I've wanted to be more organised with my to-do list, especially at work, but also for this blog.

I've tried a few different tools/applications for this, ranging from as simple as a single text/markdown file or a TODO markdown file in [Obsidian](https://obsidian.md), or a floating note in [Raycast](https://www.raycast.com/), all the way through to [daily notes](https://help.obsidian.md/plugins/daily-notes) in Obsidian with a complex system involving the [dataview](https://github.com/blacksmithgu/obsidian-dataview), [QuickAdd](https://github.com/chhoumann/quickadd) and [Templater](https://github.com/MeredithClikkie/Obsidian_Templater) plugins.

Most of these had some drawbacks that meant they either were not available where/when I needed them (e.g. only on one device) or involved too much overhead to be useful.

So I eventually settled on a dedicated service for my to-do/task list: [TickTick](https://ticktick.com). I had used TickTick long, long ago, and was pleasantly surprised to see they were still going strong and had made a lot of improvements in their UI and feature set. It is available on pretty much everything, including my Android phone, which is key to being able to quickly add things when I'm not at a computer.

But there was one other thing that always bugged me about all of these solutions that potentially a simple paper-based list would have solved: being able to always glance at the list at any point to see what was on it and quickly mark things off as I completed them.

I set out to build something mostly with things I already had available, and one new, key piece of hardware: a small touchscreen monitor. I found one on Amazon (AU) for a decent price, the [GeeekPi 7-Inch IPS LCD Touch Screen](https://www.amazon.com.au/dp/B0CJWXWJ6K).

It would be have been nice to get a e-paper/e-ink screen, but they were fairly expensive for what they were, and even more so for a touch-enabled one. I even considered trying to make my own DIY equivalent of a 

- use Hyprland + hyprctl
- kiosk workspace locked to mini monitor
- TickTick locked to kiosk workspace
- bash script to skip kiosk workspace when cycling active workspaces
- note about case sensitive bindings in Hyprland (clash with Omarchy bindings)
- touch screen device handling
- use as first HDMI input