---
title: Set custom cursor in Hyprland
description: "today iain learned: How to set a custom cursor in Hyprland"
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

```txt title="~/.config/hypr/hyprland.conf"
exec-once = hyprctl setcursor Bibata-Modern-Classic 24
```

And for Qt applications, etc:

```txt title="~/.config/hypr/hyprland.conf"
env = XCURSOR_THEME,Bibata-Modern-Classic
env = XCURSOR_SIZE,24
```
