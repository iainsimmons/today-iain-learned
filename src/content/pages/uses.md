---
title: Uses
date: 2026-06-07
description: "A list of the things I'm currently using for work and play"
noIndex: false
hideTOC: false
draft: false
aliases:
  - using
  - defaults
atUri: "at://did:plc:aoqs4f5ru6ztomatyvept7bf/site.standard.document/3mnp54spcgl2p"
---

**Last updated**: <time datetime="2026-06-07">7 June 2026</time>

## Intro

This is a list of the things I'm currently using for work and play. Mostly inspired by [Wes Bos' own `/uses` page](https://wesbos.com/uses). See the [Slash Pages](https://slashpages.net/) site for an explanation of these kinds of pages.

Also see my [dotfiles](https://github.com/iainsimmons/dotfiles) and [Neovim config](https://github.com/iainsimmons/nvim-config).

## Coding / Terminal

- [Neovim](https://neovim.io/): infinitely configurable text editor, have been using since the end of 2022

  <details>
    <summary>Neovim plugins</summary>

    - [blink.cmp](https://github.com/saghen/blink.cmp): completions
    - [boole.nvim](https://github.com/Susensio/boole.nvim): toggle/cycle things like true/false with increment/decrement keymaps (`<C-a>`/`<C-x>`)
    - [conform.nvim](https://github.com/stevearc/conform.nvim): formatting
    - [csvview.nvim](https://github.com/hat0uma/csvview.nvim): view CSV files in nice columns
    - [dev-tools.nvim](https://github.com/yarospace/dev-tools.nvim): code actions LSP
    - [dropbar.nvim](https://github.com/Bekaboo/dropbar.nvim): only using to show the current file/directory
    - [fff.nvim](https://github.com/dmtrKovalenko/fff.nvim): very fast and accurate file picker
    - [flash.nvim](https://github.com/folke/flash.nvim): jump around in a flash
    - [grug-far.nvim](https://github.com/MagicDuck/grug-far.nvim): the best global find and replace
    - [kulala.nvim](https://github.com/mistweaverco/kulala.nvim): HTTP/REST client in Neovim, uses the JetBrains http file spec
    - [lazy.nvim](https://github.com/folke/lazy.nvim): still the best plugin manager for my needs, I'm lazy loading everything
    - [mason.nvim](https://github.com/williamboman/mason.nvim): still easier than manually managing LSPs/formatters/linters
    - [mini.nvim](https://github.com/echasnovski/mini.nvim): a bunch of mini quality-of-life plugins in one
    - [noice.nvim](https://github.com/folke/noice.nvim): I like my command line / search floating on the screen (bottom, centred at the moment)
    - [nvim-bqf](https://github.com/kevinhwang91/nvim-bqf): better quickfix
    - [nvim-dap](https://github.com/mfussenegger/nvim-dap): debugging
    - [nvim-highlight-colors](https://github.com/brenoprata10/nvim-highlight-colors): highlight colours, including most formats in CSS
    - [nvim-lint](https://github.com/mfussenegger/nvim-lint): linting
    - [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig): because I'm too lazy to manually configure all my LSPs
    - [nvim-markdown-preview](https://github.com/davidgranstrom/nvim-markdown-preview): open a live-updating markdown preview in the browser
    - [nvim-treesitter-context](https://github.com/nvim-treesitter/nvim-treesitter-context): show the function I'm in
    - [nvim-treesitter-textobjects](https://github.com/nvim-treesitter/nvim-treesitter-textobjects): navigate/select inside/around a few more text objects
    - [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter): have not had much luck moving away from this yet
    - [nvim-ts-autotag](https://github.com/windwp/nvim-ts-autotag): add closing tags automatically
    - [nvim-ufo](https://github.com/kevinhwang91/nvim-ufo): folds
    - [persistence.nvim](https://github.com/folke/persistence.nvim): keep/restore my previously open buffers
    - [reactive.nvim](https://github.com/rasulomaroff/reactive.nvim): change the cursor line colour to match the mode
    - [refactoring.nvim](https://github.com/ThePrimeagen/refactoring.nvim): code actions
    - [render-markdown.nvim](https://github.com/MeanderingProgrammer/render-markdown.nvim): awesome markdown editing experience in Neovim
    - [snacks.nvim](https://github.com/folke/snacks.nvim): still using the dashboard, picker and a few other nice plugins from this
    - [snipe.nvim](https://github.com/leath-dub/snipe.nvim): quick buffer switcher, prefer this to Harpoon
    - [text-case.nvim](https://github.com/johmsalas/text-case.nvim): quickly change case of text (`kebab-case`, `snack_case`, etc)
    - [todo-comments.nvim](https://github.com/folke/todo-comments.nvim): highlight/search TODO comments in code
    - [tokyonight.nvim](https://github.com/folke/tokyonight.nvim): my forever colour scheme, also in Neovim
    - [vim-freemarker](https://github.com/andreshazard/vim-freemarker): for working with Freemarker files
    - [vim-sleuth](https://github.com/tpope/vim-sleuth): detect indentation, etc
    - [vscode-diff.nvim](https://github.com/esmuellert/vscode-diff.nvim): really nice diff tool
    - [which-key.nvim](https://github.com/folke/which-key.nvim): I still forget keymaps, particularly when in operating pending mode

    </details>

- [kitty](https://sw.kovidgoyal.net/kitty/): terminal emulator, have been using since switching from WezTerm in early 2026 (after a brief stint with Ghostty)
- [tmux](https://github.com/tmux/tmux): terminal multiplexer, I mainly use it for having different sessions, and plugins
- [sesh](https://github.com/joshmedeski/sesh): flexible and configurable CLI for quickly switching tmux sessions
- [fish](https://fishshell.com/): modern shell with great autocomplete and other features built-in
- [Tokyo Night](https://github.com/folke/tokyonight.nvim): Still my favourite theme/colour scheme that I just keep coming back to
- [CommitMono](https://commitmono.com/): monospace/programming font, can be tweaked and configured, really well balanced
- [Starship](https://starship.rs/): shell prompt, fast and configurable
- [GNU stow](https://www.gnu.org/software/stow/): dotfiles symlinking/management
- [Yazi](https://yazi-rs.github.io/): file explorer TUI, with image previews and custom file handlers
- [fzf](https://github.com/junegunn/fzf): fuzzy finder CLI and [fzf.fish](https://github.com/PatrickF1/fzf.fish) fzf plugin for fish shell
- [zoxide](https://github.com/ajeetdsouza/zoxide): A smarter `cd` command
- [lsd](https://github.com/lsd-rs/lsd): A better `ls` command
- [atuin](https://atuin.sh/): magical shell history
- [ov](https://noborus.github.io/ov/index.html): pager, with custom formats for log files, sticky headers and more
- [fnm](https://github.com/Schniz/fnm): fast and simple Node.js version manager
- [fx](https://fx.wtf/): JSON viewer & processor TUI
- [Lazygit](https://github.com/jesseduffield/lazygit): simple terminal UI for git commands

## Productivity

- [Omarchy](https://omarchy.org/): easy, but powerful introduction to the world of Arch Linux + Hyprland, well suited for web dev and customising everything to my liking
- [Brave](https://brave.com/): vertical tabs, decent ad blocking, easy to organise lots of tabs, using for work on macOS
- [Helium](https://helium.computer/): minimal browser that just does a few things well, privacy focused, using on my Linux PC
- [Raycast](https://www.raycast.com/): macOS launcher, shortcuts, window management, converter and more
- [Vicinae](https://www.vicinae.com/): basically Raycast for Linux
- [Obsidian](https://obsidian.md/): still the best notes app I've used, great for customising, and it's basically the CMS I'm using for this site (via [Astro Modular](https://github.com/davidvkimball/astro-modular))
- [TickTick](https://www.ticktick.com/): To-Do app that I sync everywhere and [[Always-on mini-monitor as a dashboard|always have running on my mini-monitor dashboard]]
- [Shottr](https://shottr.cc/): screenshot tool on macOS, with great annotation features

## Gear

- [Keychron V5](https://www.keychron.com/collections/keychron-v-series-keyboard/products/keychron-v5-qmk-custom-mechanical-keyboard): mechanical keyboard, with just the Keychron K Pro Brown switches and the ["Player" Cherry profile keycaps](https://www.keychron.com/collections/all-keycaps/products/cherry-profile-double-shot-pbt-full-set-keycaps-player)
- [Logitech MX Ergo S](https://www.logitech.com/en-au/shop/p/mx-ergo-s-wireless-trackball-mouse): trackball mouse, because I try to mainly use my keyboard, and have limited desk space
- [origimagic N2](https://amzn.asia/d/0brCyr3f): mini PC for personal use, AMD Ryzen 5 6600H (8C/16T), 32GB RAM, pretty good value, purchased at a great discount during an Amazon sale
- [Google Pixel 8](https://www.gsmarena.com/google_pixel_8-12546.php): I like that I can do whatever I want with an Android phone, including running a terminal emulator ([Termux](https://termux.dev/en/)) and connecting to my Linux PC via SSH and tmux
