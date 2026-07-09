---
title: "Upgrading to Neovim 0.12: built-in Undotree plugin, incremental selections"
date: 2026-04-11
description: "today iain learned: Some neat features that come with an upgrade to Neovim version 0.12, such as the built-in Undotree plugin and native Treesitter-based incremental selection."
tags:
  - Neovim
  - terminal
  - dotfiles
hideTOC: false
aliases:
atUri: "at://did:plc:aoqs4f5ru6ztomatyvept7bf/site.standard.document/3mnlsxri25m2l"
---

<abbr title="In Case You Missed It">ICYMI</abbr>, [Neovim version 0.12](https://neovim.io/doc/user/news-0.12/) was released at the end of March 2026. There's quite a few roundups or summaries of the various features, so I won't go into a lot of detail, but just wanted to highlight a couple of the small changes I made after upgrading.

## Undotree

[Undotree, by mbbill](https://github.com/mbbill/undotree) is a fantastic plugin. So much so that it's now been rolled into Neovim core as a built-in plugin. See the [plugin docs for Undotree](https://neovim.io/doc/user/plugins/#%3AUndotree).

There's no need to install it before using it, but you do need to enable it.

While running Neovim 0.12, you could run a command:

```vim
:packadd nvim.undotree
```

Or you could do that somewhere in your Neovim config to make it available on startup:

```lua title="~/.config/nvim/init.lua"
vim.cmd.packadd("nvim.undotree")
```

Or if you're like me and you don't really use it often, or are used to using the [lazy.vim concept of lazy-loading for a command](https://lazy.folke.io/spec#spec-lazy-loading), an equivalent would be the following (with bonus check to ensure you're running Neovim 0.12 or higher):

```lua title="~/.config/nvim/init.lua"
-- Load and toggle nvim.undotree if on Neovim v0.12+
if vim.fn.has("nvim-0.12") == 1 then
  vim.keymap.set("n", "<F5>", function()
    vim.cmd.packadd("nvim.undotree")
    vim.cmd("Undotree")
  end, { desc = "Undotree toggle" })
end
```

This way you only load it when it is actually needed.

## Incremental selections with Treesitter

Another feature that I used to use with the old [`master` branch of nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter/tree/master?tab=readme-ov-file#incremental-selection) is incremental selection. That is, you visually select a range of text, and then with treesitter, you use keymaps to increment (expand) or decrement (contract) the selection.

That used to be configured like this:

```lua title="~/.config/nvim/init.lua"
require'nvim-treesitter.configs'.setup {
  incremental_selection = {
    enable = true,
    keymaps = {
      init_selection = "gnn", -- set to `false` to disable one of the mappings
      node_incremental = "grn",
      scope_incremental = "grc",
      node_decremental = "grm",
    },
  },
}
```

On the `main` branch of `nvim-treesitter`, that's no longer a thing, but luckily this functionality was added in to the core of Neovim 0.12, with the default keymaps of <kbd>v</kbd> <kbd>a</kbd> <kbd>n</kbd> to increment and <kbd>v</kbd> <kbd>i</kbd> <kbd>n</kbd> to decrement. See the [Neovim treesitter docs](https://neovim.io/doc/user/treesitter/#treesitter-incremental-selection).

The default mappings aren't bad, though you have to first do <kbd>v</kbd> <kbd>a</kbd> <kbd>n</kbd> to increment in normal mode, and then switch to just repeating <kbd>a</kbd> <kbd>n</kbd> to further increment in visual mode (and similar with <kbd>v</kbd> <kbd>i</kbd> <kbd>n</kbd> to decrement from normal mode and then repeat <kbd>i</kbd> <kbd>n</kbd> in visual mode).

I wanted some alternative keymaps (normally I'd go with <kbd>Ctrl</kbd> + <kbd>Space</kbd> to increment and <kbd>Backspace</kbd> to decrement, but these were not working for me in Linux, only in macOS).

I had to dig around in the Neovim source code to find the implementation. You can find them in [this commit where the new default keymaps were added](https://github.com/neovim/neovim/commit/72d3a57f270fdca5e592dcf2e4b7c3b00549c05e#diff-fcb32cf99107c4b71f964a0949cf50edcf3965c1191152e3d8db1256f5513ba7R458-R472).

Here's how I added them to my configuration:

```lua title="~/.config/nvim/init.lua"
-- Enable incremental selection keymaps
local function increment_selection()
  if vim.treesitter.get_parser(nil, nil, { error = false }) then
    require("vim.treesitter._select").select_parent(vim.v.count1)
  else
    vim.lsp.buf.selection_range(vim.v.count1)
  end
end

local function decrement_selection()
  if vim.treesitter.get_parser(nil, nil, { error = false }) then
    require("vim.treesitter._select").select_child(vim.v.count1)
  else
    vim.lsp.buf.selection_range(-vim.v.count1)
  end
end

vim.keymap.set("n", "]]", function()
  vim.cmd("normal! v")
  increment_selection()
end, { desc = "Increment selection" })
vim.keymap.set("n", "[[", function()
  vim.cmd("normal! v")
  decrement_selection()
end, { desc = "Decrement selection" })
vim.keymap.set({ "x", "o" }, "]]", increment_selection, { desc = "Increment selection" })
vim.keymap.set({ "x", "o" }, "[[", decrement_selection, { desc = "Decrement selection" })
```

You'll notice that I first need to trigger visual mode if using these from normal mode. That took me a little while to figure out, but it works well, and it's the same in normal and visual mode.

Here's how it looks:

::video{title="Incremental selection in Neovim version 0.12" src="/posts/attachments/nvim-incremental-selection.mp4"}

## The rest

I haven't yet switched to using [`vim.pack.add`](<https://neovim.io/doc/user/pack/#vim.pack.add()>) and native plugin management. I've finely tuned my lazy.nvim based config and have not yet seen a compelling reason to move away from it.
