---
title: How to fix WezTerm in Hyprland
description: "today iain learned: How to fix WezTerm in Hyprland"
date: 2025-11-06
tags:
  - terminal
  - hyprland
  - linux
  - dotfiles
  - wezterm
---

I was having issues with opening WezTerm in Hyprland until I added the following to the configuration (`~/.config/wezterm/wezterm.lua`):

```lua
config.front_end = "WebGpu"
config.webgpu_power_preference = "HighPerformance"
```

It's mainly the `front_end`, and perhaps it's specific to my particular computer hardware, but it's the only thing that worked.

And yes, I tried `config.enabled_wayland = false` and that did not fix it, though if combined with the above, makes for slightly nicer font rendering (closer to how kitty looks).

Here's the rest of my [WezTerm configuration](https://github.com/iainsimmons/dotfiles/blob/archlinux/.config/wezterm/wezterm.lua) (on Arch Linux).
