---
title: Set custom cursor in Hyprland
description: "today iain learned: Set custom cursor in Hyprland"
date: 2025-10-30
tags:
  - linux
  - ricing
  - hyprland
---
Using the really nice [Bibata](https://www.bibata.live/) (here via the AUR) and [setting via hyprctl](https://wiki.hypr.land/Configuring/Using-hyprctl/#setcursor):

```sh
paru -S bibata-cursor-theme-bin
hyprctl setcursor Bibata-Modern-Classic 24
```

And add to the Hyprland configuration:

`~/.config/hypr/autostart.conf` or `~/.config/hypr/hyprland.conf`

```sh
exec-once = hyprctl setcursor Bibata-Modern-Classic 24
```

And for Qt applications, etc:

`~/.config/hypr/envs.conf` or `~/.config/hypr/hyprland.conf`

```sh
env = XCURSOR_THEME,Bibata-Modern-Classic
env = XCURSOR_SIZE,24
```
