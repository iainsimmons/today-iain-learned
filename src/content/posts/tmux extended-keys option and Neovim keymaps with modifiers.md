---
title: tmux extended-keys option and Neovim keymaps with modifiers
date: 2026-04-26
description: "today iain learned: tmux extended-keys option and Neovim keymaps with modifiers"
tags:
  - terminal
  - CLI
  - tmux
  - Neovim
hideTOC: false
draft: false
---
Recently I switched back to using [tmux](https://github.com/tmux/tmux), along with moving from [WezTerm](https://wezterm.org/) to [Ghostty](https://ghostty.org/). This was mostly because WezTerm was becoming increasingly buggy, and didn't seem to be well maintained any longer (understandable, given how much a terminal emulator is expected to do these days). Also, I missed using [sesh](https://github.com/joshmedeski/sesh), my favourite tool for managing sessions in a terminal.

One thing that has bugged me about tmux, and in particular about using Neovim in tmux, is that some keymaps in Neovim seemed to just not work. They would often send other key presses or sequences, making them effectively useless. Once such example was trying to map <kbd>Ctrl</kbd> + <kbd>Space</kbd> to [[Upgrading to Neovim 0.12: built-in Undotree plugin, incremental selections|increment and decrement the visual selection using Treesitter]]. As far as I could tell, Neovim only received the <kbd>Space</kbd> key press.

While watching a video on YouTube: [Pi: The Minimal Agent for REAL Devs from DevOps Toolbox][1], I saw one part of the Pi TUI that mentioned some keybinds that use modifier keys might not work without the `extended-keys` option in tmux. That was the first I had heard of it, so I started looking into it.

I first found this helpful site and page: [How to fix modifier key issues in tmux? - TmuxAI](https://tmuxai.dev/tmux-modifier-keys/).

Given the "AI" in the site name, I of course validated it against the official docs: [Modifier Keys on the tmux wiki](https://github.com/tmux/tmux/wiki/Modifier-Keys#extended-keys).

The general gist of it is that you want to turn _on_ the `extended-keys` option, and also set additional terminal features to make sure they are passed on to the underlying terminal. I also have `allow-passthrough` set to `on`, as this generally seems to help with tmux compatibility with various terminal features and escape sequences. 

```txt title="~/.tmux.conf"
set -g allow-passthrough on
set -g extended-keys on
set -g terminal-features 'xterm*:extkeys'
```

And the result is that I can now use `Ctrl + Space`as a keymap in Neovim:

```lua title="~/.config/nvim/init.lua"
vim.keymap.set("n", "<C-Space>", function()
  vim.cmd("normal! v")
  increment_selection()
end, { desc = "Increment selection" })
vim.keymap.set("n", "<BS>", function()
  vim.cmd("normal! v")
  decrement_selection()
end, { desc = "Decrement selection" })
vim.keymap.set({ "x", "o" }, "<C-Space>", increment_selection, { desc = "Increment selection" })
vim.keymap.set({ "x", "o" }, "<BS>", decrement_selection, { desc = "Decrement selection" })
```

So if there are any other keymaps you're using in Neovim (or other TUIs) from within tmux that just don't seem to work, try enabling the `extended-keys` option in your tmux configuration.

[1]: https://youtu.be/OMFIPv8a4qA