---
title: Add keybinds or shortcuts for other keys in Hyprland
description: "today iain learned: Add keybinds or shortcuts for other keys in Hyprland"
date: 2025-11-15
tags:
  - hyprland
  - linux
  - dotfiles
---
I recently added some [keybinds](https://wiki.hypr.land/Configuring/Binds/) to my Hyprland config so I could get `Super + Left` and `Super + Right` to send the `Home` and `End` keys, respectively.

`~/.config/hypr/bindings.conf` or `~/.config/hypr/hyprland.conf`

```sh
bind = SUPER, LEFT, sendshortcut, , HOME,
bind = SUPER, RIGHT, sendshortcut, , END,
```

That one was simple enough, as was binding `Super + Backspace` to `Delete`:

```sh
bind = SUPER, BACKSPACE, sendshortcut, , DELETE,
```

You might wonder if those extra commas are required. They are, the blank space and comma between `sendshortcut` and the key/shortcut to send is for modifier keys, and the last argument/parameter (after the final comma) is the window. Therefore these will work in all windows in Hyprland.

Here's an example with the modifiers, so I can effectively use `Super + Shift + Left` as `Shift + Home` and `Super + Shift + Right` as `Shift + End`:

```sh
bind = SUPER SHIFT, LEFT, sendshortcut, SHIFT, HOME,
bind = SUPER SHIFT, RIGHT, sendshortcut, SHIFT, END,
```

But I couldn't for the life of me figure out how I could bind `Super + Up` and `Super + Down` to the `Page Up` and `Page Down` keys.

The [Hyprland docs](https://wiki.hypr.land/Configuring/Binds/) give the helpful note:

> **(i) Note**
> If you are unsure of what your key’s name or keycode is, you can use [wev](https://github.com/jwrdegoede/wev) to find out.

So I installed `wev`, ran it, and hit my `Page Up` and `Page Down` keys and was presented with the following (amongst a bunch of other stuff that means nothing to me right now):

```sh
[        16:     wl_keyboard] key: serial: 11117; time: 1409027; key: 112; state: 1 (pressed)
                      sym: Prior        (65365), utf8: ''
[        16:     wl_keyboard] key: serial: 11118; time: 1409093; key: 112; state: 0 (released)
                      sym: Prior        (65365), utf8: ''
[        16:     wl_keyboard] key: serial: 11119; time: 1410548; key: 117; state: 1 (pressed)
                      sym: Next         (65366), utf8: ''
[        16:     wl_keyboard] key: serial: 11120; time: 1410615; key: 117; state: 0 (released)
                      sym: Next         (65366), utf8: ''
```

The **_key_** part (pun intended!) being the `sym: Prior` and `sym: Next`. I admit, I've never seen `Page Up` referred to as `Prior` and `Page Down` referred to as `Next`, but here we are.

Then it was just a matter of mapping those the same as the others:

```sh
bind = SUPER, UP, sendshortcut, , PRIOR,
bind = SUPER, DOWN, sendshortcut, , NEXT,
bind = SUPER SHIFT, UP, sendshortcut, SHIFT, PRIOR,
bind = SUPER SHIFT, DOWN, sendshortcut, SHIFT, NEXT,
```

You can view [these and other keybind examples in my dotfiles](https://github.com/iainsimmons/dotfiles/blob/archlinux/.config/hypr/bindings.conf).

And here's the [Hyprland docs for the dispatchers](https://wiki.hypr.land/Configuring/Dispatchers/#list-of-dispatchers) like `sendshortcut`.
