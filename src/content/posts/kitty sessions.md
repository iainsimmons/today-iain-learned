---
title: kitty sessions
description: "today iain learned: kitty sessions"
date: 2025-11-03
tags:
  - terminal
  - dotfiles
  - kitty
---
The [kitty terminal](https://sw.kovidgoyal.net/kitty/) has a relatively new [sessions](https://sw.kovidgoyal.net/kitty/sessions/#sessions) feature, and it is very well implemented and pretty straightforward to set up.

Create some `.kitty-session` files somewhere:

```sh
mkdir -pv ~/.config/kitty/sessions
touch ~/.config/kitty/sessions/dotfiles.kitty-session
```

And then place kitty commands in them to launch tabs/windows and configure it as needed:

`dotfiles.kitty-session`

```sh
# Set the title of the window in your OS
os_window_title "dotfiles"
# Set the layout for the current tab
layout tall
# Set the working directory for windows in the current tab
cd ~/dotfiles
# Create the "main" window and run an editor in it to edit the files
launch --title "nvim" /usr/bin/nvim
```

And then set up [keymaps](https://sw.kovidgoyal.net/kitty/conf/#keyboard-shortcuts) either directly to a session (this one is `hyper+t`, then `h` for home, as I use `d` for my downloads session):

```conf
map super+ctrl+shift+alt+t>h goto_session ~/.config/kitty/sessions/dotfiles.kitty-session
```

Or use the simple session picker available out-of-the-box:
![[kitty-session-picker.png|kitty session picker]]

And add a keymap for that, switching to the last session, and closing a session:

```conf
map super+j goto_session
map super+l goto_session -- -1
map super+shift+w close_session
```
