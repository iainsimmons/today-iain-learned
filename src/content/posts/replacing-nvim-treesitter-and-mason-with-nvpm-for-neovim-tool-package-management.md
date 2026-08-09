---
title: "Replacing nvim-treesitter and Mason with NVPM for Neovim tool package management"
date: 2026-08-08
description: "today iain learned: How to replace nvim-treesitter and Mason with NVPM, and protect against supply chain attacks in tools that depend on git repositories."
tags:
  - Neovim
  - terminal
  - dotfiles
  - CLI
  - Tree-sitter
  - LSP
hideTOC: false
---

Most of you who are actively maintaining and updating your own Neovim config would be aware of the drama earlier this year (April 2026) surrounding [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) where the maintainer archived the repository.

I won't go into that or the politics around open source software, but you can read about it on Reddit or elsewhere if you're curious: [What happened to nvim-treesitter… Why did it get archived?](https://www.reddit.com/r/neovim/comments/1sbrnir/what_happened_to_nvimtreesitter_why_did_it_get/)

Instead, I'll focus on an alternative solution for managing things like Tree-sitter parsers that also addresses the rising concerns with supply chain attacks on open source software in git repositories that are often updated automatically via package management tools.

## NVPM

[NVPM](https://nvpm.dev/) is an "editor-agnostic package manager for Tree-sitter parsers, LSP servers, DAP servers, linters and formatters and more". If you're using Neovim, there's a good chance you were at some point using `nvim-treesitter` and [mason.nvim](https://github.com/mason-org/mason.nvim) to manage all of those things. This system can replace both of those plugins, as long as you're comfortable managing those tools/packages via a CLI.

The [NVPM client](https://github.com/mistweaverco/nvpm-client) is the heart of the system. It is the CLI tool that I am now using to install the necessary packages for Tree-sitter, LSP, linting and formatting within Neovim.

By default, it uses the [NVPM registry](https://registry.nvpm.dev/) to source the packages (or at least the metadata about them), but you can use something else. Installs still use the original source, such as `npm`, `golang` or a git repository.

There is also a [nvpm.nvim plugin](https://github.com/mistweaverco/nvpm.nvim) for Neovim integration, but if you have all the necessary files/binaries in the right paths, it is not required. It can even be used as a replacement for [lazy.nvim](https://github.com/folke/lazy.nvim), though I've not yet taken things that far.

## Tree-sitter

My Tree-sitter configuration was greatly simplified, and now, aside from other plugins based on Tree-sitter, is mostly powered by the following (which assumes the parsers are already available in the `/site/parser/` subdirectory in Neovim's [data standard path](https://neovim.io/doc/user/starting/#_standard-paths)):

```lua title="lua/plugins/treesitter.lua"
vim.api.nvim_create_autocmd("FileType", {
  callback = function(args)
    -- Enable highlighting for all filetypes
    local lang = vim.treesitter.language.get_lang(vim.bo[args.buf].filetype)
    if lang and pcall(vim.treesitter.language.add, lang) then
      -- Only start treesitter when the parser ships highlight queries; otherwise
      -- fall back to the built-in syntax highlighting
      if vim.treesitter.query.get(lang, "highlights") then
        pcall(vim.treesitter.start, args.buf, lang)
        -- disable Treesitter Context for Kulala UI buffers
        if lang == "kulala_ui" then
          vim.cmd("TSContext disable")
        end
      end
    end
  end,
})


```

New Tree-sitter parsers should be installed (for Neovim) with the following command:

```sh
nvpm add --integrate neovim <package>
```

For example, to install the JavaScript parser:

```sh
nvpm add --integrate neovim tree-sitter/tree-sitter-javascript
```

I'd also recommend getting the [CLI autocompletion in the NVPM client](https://github.com/mistweaverco/nvpm-client#cli-autocompletion) working to make it easier to find what you need (most Tree-sitter parsers start with a `tree-sitter-` prefix).

Alternatively, you can list only Tree-sitter parsers in the registry with the following command (optionally with a search query on the end):

```sh
nvpm ls --all --only-categories=tree-sitter-parser
```

## LSP Servers, Linters, Formatters

For LSP servers in Neovim, I'm still using [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig) for the individual server configurations, but I've removed `mason.nvim`, `mason-lspconfig.nvim` and `mason-tool-installer.nvim`.

LSP servers simply need their corresponding command to be on the PATH, like anything else.

You can find a list of LSP servers by querying the registry (again with an optional search query on the end):

```sh
nvpm ls --all --only-categories=lsp
```

For example, to find the Astro LSP server:

```sh
nvpm ls --all --only-categories lsp astro
```

Which outputs the following in the terminal:

```
  ## 📚 All Available Packages

  Found 1 packages in the registry matching name filters: astro - categories: lsp

  ### 🔹 NPM Packages (1)

   Package ID                   │ Version │ Status                   │ Description
  ──────────────────────────────┼─────────┼──────────────────────────┼───────────────────────────────────────────────────────────────────
   npm:@astrojs/language-server │ 2.16.13 │ ✅ Installed, up to date │ The Astro language server, its structure is inspired by the
                                │         │                          │ Svelte Language Server.
                                │         │                          │
                                │         │                          │
```

You can then install it using the package ID:

```sh
nvpm add npm:@astrojs/language-server
```

My linting and formatting configurations in Neovim did not require any changes, I just had to find and install the required binaries in a similar manner to the above.

## Security and updating packages

To update all packages installed by NVPM, you can run the following:

```sh
nvpm update --all  # or: nvpm up -A
```

You might see an error while attempting to install or update, similar to the following:

```
Updating all installed packages to latest versions...
Found 38 installed packages
Updating 2 package(s) with available updates (skipping 36 up-to-date package(s))

level=ERROR msg="min-release-age: github:tree-sitter/tree-sitter-regex@v1.0.0+17a3293714312c691ef14217f60593a3d093381c was first discovered 20h3m1s ago; wait 147h56m59s more or pass --force"
[✗] Failed to update github:tree-sitter/tree-sitter-regex

level=ERROR msg="min-release-age: npm:@mistweaverco/kulala-fmt@4.5.3 was first discovered 20h3m1s ago; wait 147h56m59s more or pass --force"
[✗] Failed to update npm:@mistweaverco/kulala-fmt

Update Summary:
  Successfully updated: 0
  Failed to update: 2
  Skipped (up to date): 36
Failed to update some packages
```

This is for your security, and kind of the whole point of this tool. If you are installing something for the first time and you trust the current/latest version and the author, then you may want to add the `--force` flag:

```sh
nvpm add --force npm:@mistweaverco/kulala-fmt
```

I would recommend **_not_** using `--force` for updates after the initial install, because that's how [supply chain attacks](https://www.cloudflare.com/learning/security/what-is-a-supply-chain-attack/) work, by relying on people blindly updating to the latest, compromised version of a package via their package manager.

If you do somehow have complete trust in the author (for example, if **_you are the author_**), then you can add the `--always-trust` flag and from that point forward, it will ignore the minimum release age while adding/updating that package:

```sh
nvpm add --always-trust npm:@mistweaverco/kulala-fmt
```

There are many other CLI flags and configuration options described in the [nvpm-client README.md](https://github.com/mistweaverco/nvpm-client/blob/main/README.md)

## Registry

Finally, you can browse the NVPM registry in a browser: [registry.nvpm.dev](https://registry.nvpm.dev/).

I'd recommend giving NVPM a shot if you want to securely manage your Neovim tool packages.
